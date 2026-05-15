import Repo from "../models/repo.model.js";
import File from "../models/file.model.js";
import Security from "../models/SecurityScan.model.js";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";

export const startScan = async (req, res) => {
  let scan;
  try {
    const { repoId } = req.params;
    const userId = req.userId;
    const repo = await Repo.findById(repoId);
    if (!repo) {
      return res.status(404).json({
        success: false,
        message: "repo not found",
      });
    }
    const files = await File.find({ repoId, userId });
    const filteredFiles = files.filter((file) => {
      const ext = "." + file.fileName.split(".").pop().toLowerCase();
      return [".js", ".ts", ".jsx", ".tsx", ".py"].includes(ext);
    });

    if (!filteredFiles || filteredFiles.length === 0) {
      return res.status(400).json({
        success: false,
        message: "filteredFiles not present",
      });
    }
    scan = await Security.create({
      userId,
      repoId,
      status: "scanning",
    });

    const model = new ChatGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY,
      model: "gemini-2.5-flash",
      temperature: 0.3,
    });
    const prompt = PromptTemplate.fromTemplate(`
    You are an expert code security auditor.
    
    Analyze the following code files for security vulnerabilities including:
    - Hardcoded secrets, API keys, passwords
    - SQL/NoSQL injection vulnerabilities  
    - Weak authentication or authorization
    - Insecure imports or dependencies
    - XSS, CSRF vulnerabilities
    - Any other critical security issues
    
    Return ONLY a valid JSON object, no extra text, no markdown, no backticks.
    
    Format:
    {{
      "issues": [
        {{
          "severity": "critical" | "high" | "medium" | "low",
          "file": "filename here",
          "line": line_number,
          "description": "what is the problem",
          "suggestion": "how to fix it",
          "codeSnippet": "the vulnerable code line here",
          "fixedCode": "the corrected/fixed version of the code"
        }}
      ]
    }}
    
    Code to analyze:
    {content}
    `);
    const chain = RunnableSequence.from([
      prompt,
      model,
      new StringOutputParser(),
    ]);

    const BATCH_SIZE = 5;
    const allIssues = [];

    for (let i = 0; i < filteredFiles.length; i += BATCH_SIZE) {
      const batch = filteredFiles.slice(i, i + BATCH_SIZE);
      const combinedContent = batch
        .map((file) => `File: ${file.fileName}\nContent: ${file.content}`)
        .join("\n\n");

      const result = await chain.invoke({ content: combinedContent });
      const cleaned = result.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      allIssues.push(...parsed.issues);

      await new Promise((r) => setTimeout(r, 3000));
    }
    let severity = "low";
    if (allIssues.some((i) => i.severity === "critical")) severity = "critical";
    else if (allIssues.some((i) => i.severity === "high")) severity = "high";
    else if (allIssues.some((i) => i.severity === "medium"))
      severity = "medium";
    const critical = allIssues.filter((i) => i.severity === "critical").length;
    const high = allIssues.filter((i) => i.severity === "high").length;
    const medium = allIssues.filter((i) => i.severity === "medium").length;
    const low = allIssues.filter((i) => i.severity === "low").length;

    let score = 100;
    score -= Math.min(critical * 10, 40);
    score -= Math.min(high * 7, 30);
    score -= Math.min(medium * 4, 20);
    score -= Math.min(low * 2, 10);
    score = Math.max(0, score);
    const changes = await Security.findByIdAndUpdate(
      scan._id,
      {
        userId,
        repoId,
        issues: allIssues,
        severity,
        score,
        status: "completed",
      },
      { new: true },
    );

    return res.status(200).json({
      success: true,
      message: "start Scan created successfully",
      changes,
    });
  } catch (error) {
    if (scan) {
      await Security.findByIdAndUpdate(
        scan._id,
        {
          status: "failed",
        },
        { new: true },
      );
    }
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "start scan server error",
    });
  }
};

export const getScanResult = async (req, res) => {
  try {
    const { repoId } = req.params;
    const repo = await Repo.findById(repoId);
    if (!repo) {
      return res.status(404).json({
        success: false,
        message: "repo not found",
      });
    }
    const getScan = await Security.findOne({ repoId });
    if (!getScan) {
      return res.status(404).json({
        success: false,
        message: "scan not found, please run scan first",
      });
    }

    return res.status(200).json({
      success: true,
      message: "all files security provided",
      getScan,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "get scan server error",
    });
  }
};

export const getIssuesByFile = async (req, res) => {
  try {
    const { repoId, fileName } = req.params;
    const repo = await Repo.findById(repoId);
    if (!repo) {
      return res.status(404).json({
        success: false,
        message: "repo not found",
      });
    }

    const scan = await Security.findOne({ repoId });
    if (!scan) {
      return res.status(404).json({
        success: false,
        message: "file not found",
      });
    }
    const fileIssues = scan.issues.filter((i) => i.file === fileName);
    if (fileIssues.length === 0) {
      return res.status(404).json({
        success: false,
        message: "no issues found for this file",
      });
    }
    return res.status(200).json({
      success: true,
      message: "file found successfully",
      fileIssues,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "singleFile server error",
    });
  }
};
