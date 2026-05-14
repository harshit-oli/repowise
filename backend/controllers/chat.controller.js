import { Pinecone } from "@pinecone-database/pinecone";
import * as dotenv from "dotenv";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Chat from "../models/chat.model.js";
import Repo from "../models/repo.model.js";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const embeddingModel = genAI.getGenerativeModel({
  model: "models/gemini-embedding-001",
});

async function embedQuery(text) {
  const result = await embeddingModel.embedContent(text);

  return result.embedding.values.slice(0, 768);
}

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);

async function generateQueries(question) {
  const model = new ChatGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
    model: "gemini-2.5-flash",
    temperature: 0.3,
  });

  const prompt = PromptTemplate.fromTemplate(`
You are a helpful assistant for a GitHub repository search engine.

Given a user's question about code, generate 3 semantically similar search queries.

Question:
{question}

Instructions:
- Fix any typos or spelling mistakes in the question first
- Keep queries concise and specific to code/files
- Maintain the same meaning
- Return ONLY the 3 queries, one per line, no numbering, no extra text
`);

  const chain = RunnableSequence.from([
    prompt,
    model,
    new StringOutputParser(),
  ]);

  const result = await chain.invoke({
    question,
  });

  return [
    question,
    ...result
      .split("\n")
      .map((q) => q.replace(/^\d+\.\s*/, "").trim())
      .filter(Boolean),
  ];
}

async function chatting(question, repo) {
  // STEP 1 → Generate multiple queries

  const queries = await generateQueries(question);

  // STEP 2 → Create embeddings

  const queryVectors = await Promise.all(queries.map((q) => embedQuery(q)));

  // STEP 3 → Parallel Pinecone retrieval

  const searchResults = await Promise.all(
    queryVectors.map((vector) =>
      pineconeIndex.query({
        topK: 10,
        vector,
        includeMetadata: true,

        // IMPORTANT
        filter: {
          repoId: { $eq: repo },
        },
      }),
    ),
  );

  // STEP 4 → Merge all matches

  const allMatches = searchResults.flatMap((r) => r.matches);
  if (!allMatches.length) {
    return {
      answer: "No relevant context found.",
      context: "",
    };
  }
  // STEP 5 → Score Fusion

  const scoreMap = new Map();

  for (const m of allMatches) {
    const id = m.id || m._id;

    const score = m.score ?? 0;

    scoreMap.set(id, {
      ...m,

      score: (scoreMap.get(id)?.score || 0) + score,
    });
  }

  // STEP 6 → Sort by best score

  const uniqueDocs = Array.from(scoreMap.values()).sort(
    (a, b) => b.score - a.score,
  );

  // STEP 7 → Create context

  const context = uniqueDocs
    .slice(0, 5)
    .map((match) => match.metadata.text)
    .join("\n\n---\n\n");

  // STEP 8 → Final LLM Answer

  const model = new ChatGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
    model: "gemini-2.5-flash",
    temperature: 0.3,
  });

  const promptTemplate = PromptTemplate.fromTemplate(`
You are an expert code assistant helping developers
understand a GitHub repository.

Context from the codebase:
{context}

Developer's Question:
{question}

Instructions:
- Answer using ONLY the provided context
- If answer not found say: "I don't have enough information about this."
- Be concise and clear
- Use code examples from context if relevant
- Mention file names when referencing code

Answer:
`);

  const chain = RunnableSequence.from([
    promptTemplate,
    model,
    new StringOutputParser(),
  ]);

  const answer = await chain.invoke({
    context,
    question,
  });

  return {
    answer,
    context,
  };
}

export const sendMessage = async (req, res) => {
  try {
    const { repoId } = req.params;
    const { content } = req.body;
    const { answer, context } = await chatting(content, repoId);

    await Chat.create({
      userId: req.userId,
      repoId,
      role: "User",
      content: content,
      context: context,
    });
    await Chat.create({
      userId: req.userId,
      repoId,
      role: "Assistant",
      content: answer,
    });

    return res.status(200).json({
      success: true,
      message: "message send",
      userMessage: content,
      aiMessage: answer,
      context: context,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "sendMessage server error",
    });
  }
};

export const getChatHistory = async (req, res) => {
  try {
    const { repoId } = req.params;
    const repo = await Repo.findById(repoId);
    if (!repo) {
      return res.status(404).json({
        success: false,
        message: "repo not found",
      });
    }
    const chat = await Chat.find({ repoId }).sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      message: "chat found successfully",
      chat,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "chat server error",
    });
  }
};

export const clearChat = async (req, res) => {
  try {
    const { repoId } = req.params;
    const repo = await Repo.findById(repoId);
    if (!repo) {
      return res.status(404).json({
        success: false,
        message: "repo not found",
      });
    }
    if (repo.userId.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    await Chat.deleteMany({ repoId });
    return res.status(200).json({
      success: true,
      message: "all chat deleted",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "clear Chat server error",
    });
  }
};
