import { GoogleGenerativeAI } from "@google/generative-ai";
import CommitHistory from "../models/CommitHistory.model.js";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import Repo from "../models/repo.model.js";
import { Octokit } from "@octokit/rest";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const fetchHistory = async (req, res) => {
  try {
    const { repoId } = req.params;
    const repo = await Repo.findById(repoId);
    if (!repo) {
      return res.status(404).json({
        success: false,
        message: "repo not found",
      });
    }
    const findUrlInfo = repo.repoUrl.split("/");
    const owner = findUrlInfo[3];

    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });
    const commits = [];

    const { data } = await octokit.repos.listCommits({
      owner,
      repo: repo.repoName,
      per_page: 10,
    });

    for (const commit of data) {
      const { data: commitDetail } = await octokit.repos.getCommit({
        owner,
        repo: repo.repoName,
        ref: commit.sha, //ye btata h ki kis specific commit ki details laani h
      });

      commits.push({
        sha: commit.sha,
        message: commit.commit.message,
        author: commit.commit.author.name,
        date: commit.commit.author.date,
        filesChanged: commitDetail.files.map((f) => f.filename),
       diff: commitDetail.files
       .filter(f => !f.filename.includes('node_modules') && !f.filename.includes('package-lock'))
       .map(f => f.patch || '')
       .join("\n\n")
       });
    }

    const fetchedHistory = await CommitHistory.create({
      repoId,
      commits,
    });

    return res.status(200).json({
      success: true,
      message: "history fetched successfully",
      fetchedHistory,
    }); 
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "fetchedHistory server error",
    });
  }
};

export const getHistory = async (req, res) => {
  try {
    const { repoId } = req.params;

    const repo = await Repo.findById(repoId);

    if (!repo) {
      return res.status(404).json({
        success: false,
        message: "repo not found",
      });
    }
    const history = await CommitHistory.findOne({ repoId });
    if (!history) {
      return res.status(404).json({
        success: false,
        message: "No commit history found, please fetch first",
      });
    }

    return res.status(200).json({
      success: true,
      message: "commits find successfully",
      history,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "getHistory server error",
    });
  }
};

export const analyzeCommit = async (req, res) => {
  try {
    const { repoId, sha } = req.params;

    const history = await CommitHistory.findOne({ repoId });

    if (!history) {
      return res.status(404).json({
        success: false,
        message: "history not found",
      });
    }
    const commit = history.commits.find((c) => c.sha === sha);
    if (!commit) {
      return res.status(404).json({
        success: false,
        message: "sha not present",
      });
    }

    const model = new ChatGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY,
      model: "gemini-2.5-flash",
      temperature: 0.3,
    });

    const prompt = PromptTemplate.fromTemplate(`
You are an expert code reviewer.

Analyze this git commit diff and explain:
- What changes were made
- Why these changes might have been made
- Impact of these changes

Commit Message: {message}
Diff:
{diff}

Provide a clear, concise analysis.
`);

    const chain = RunnableSequence.from([
      prompt,
      model,
      new StringOutputParser(),
    ]);

    const result = await chain.invoke({
      message: commit.message,
      diff: commit.diff,
    });

    return res.status(200).json({
      success: true,
      message: "analyseCommit successfully",
      result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "analyzeCommit server error",
    });
  }
};

export const timeMachineQuery = async (req, res) => {
  try {
    const {question} = req.body;
    const {repoId} = req.params;
    const history = await CommitHistory.findOne({ repoId });
    if (!history) {
      return res.status(404).json({
        success: false,
        message: "history not found",
      });
    }
    const allDiffs = history.commits
      .map((c) => `Date: ${c.date}\nMessage: ${c.message}\nDiff: ${c.diff}`)
      .join("\n\n---\n\n");

    const model = new ChatGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY,
      model: "gemini-2.5-flash",
      temperature: 0.3,
    });

    const prompt = PromptTemplate.fromTemplate(`
You are an expert code historian analyzing git commit history.

Commit History:
{allDiffs}

Developer's Question:
{question}

Instructions:
- Answer using ONLY the provided commit history
- Mention specific dates and commit messages when relevant
- If answer not found say: "I don't have enough information."
- Be concise and clear

Answer:
`);

    const chain = RunnableSequence.from([
      prompt,
      model,
      new StringOutputParser(),
    ]);

    const result = await chain.invoke({
      question,
      allDiffs,
    });

    return res.status(200).json({
      success: true,
      message: "history find successfully",
      result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "timeMachineQuery server error",
    });
  }
};
