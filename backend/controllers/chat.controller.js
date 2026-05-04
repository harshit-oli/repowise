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

const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);
async function chatting(question, repo) {
  const queryVector = await embedQuery(question);

  const searchResults = await pineconeIndex.query({
    topK: 20,
    vector: queryVector,
    includeMetadata: true,
    filter: { repoId: { $eq: repo } },
  });
  const context = searchResults.matches
    .map((match) => match.metadata.text)
    .join("\n\n---\n\n");

  // then result lane ke baad query + top10 result LLM ko denge
  const model = new ChatGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
    model: "gemini-2.5-flash",
    temperature: 0.3,
  });

  const promptTemplate = PromptTemplate.fromTemplate(`
You are an expert code assistant helping developers 
understand a GitHub repository. Answer questions about 
the codebase based on the provided code context.

Context from the documentation:
{context}

Question: {question}

Instructions:
- Answer the question using ONLY the information from the context above
- If the answer is not in the context, say "I don't have enough information to answer that question."
- Be concise and clear
- Use code examples from the context if relevant

Answer:
        `);

  const chain = RunnableSequence.from([
    promptTemplate,
    model,
    new StringOutputParser(),
  ]);

  // Step 6: Invoke the chain and get the answer
  const answer = await chain.invoke({
    context: context,
    question: question,
  });
  return { answer, context };
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
