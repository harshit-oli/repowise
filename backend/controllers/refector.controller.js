import { GoogleGenerativeAI } from "@google/generative-ai";
import Repo from "../models/repo.model.js";
import File from "../models/file.model.js";
import Refactor from "../models/refector.model.js";
import User from "../models/auth.model.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
export const generateSuggestions = async (req, res) => {
  try {
    const { repoId } = req.params;

    const repo = await Repo.findById(repoId);
    if (!repo) {
      return res
        .status(404)
        .json({ success: false, message: "repo not found" });
    }

    if (req.userId !== repo.userId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const user = await User.findById(req.userId);
    if (!user?.githubAccessToken) {
      return res
        .status(401)
        .json({ success: false, message: "GitHub not connected" });
    }
    if (user.usage.remainingCredits <= 0) {
      return res.status(403).json({
        success: false,
        message: "Credits exhausted, please upgrade to Pro plan",
      });
    }

    const files = await File.find({ repoId });
    if (files.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No files found" });
    }
    const codeContext = files
      .map((file) => `File: ${file.fileName}\n${file.content}`)
      .join("\n\n---\n\n");
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `
Analyze this codebase for code quality issues. Return ONLY valid JSON, no markdown, no backticks.

Here are examples of good suggestions:

EXAMPLE 1 - Duplicate code:
Code: 
function getUserData(id) { const u = db.find(id); return u; }
function getProductData(id) { const u = db.find(id); return u; }

Output:
{
    "type": "duplicate",
    "files": ["user.js", "product.js"],
    "description": "getUserData and getProductData have identical logic",
    "suggestion": "Create a generic getData(id, collection) function",
    "codeSnippet": "function getUserData(id) { const u = db.find(id); return u; }",
    "priority": "high"
}

EXAMPLE 2 - Complexity:
Code:
function a(x, y, z, p, q) { if(x > 0) { if(y > 0) { if(z > 0) { return x+y+z; }}}}

Output:
{
    "type": "complexity",
    "files": ["utils.js"],
    "description": "Deeply nested if statements make code hard to read",
    "suggestion": "Use early returns to flatten the nesting",
    "codeSnippet": "function a(x, y, z, p, q) {...}",
    "priority": "medium"
}

EXAMPLE 3 - Naming:
Code:
function fn1(a, b) { return a + b; }
const x = getUserData();

Output:
{
    "type": "naming",
    "files": ["helpers.js"],
    "description": "fn1 and x are not descriptive variable/function names",
    "suggestion": "Use meaningful names like addNumbers() and userData",
    "codeSnippet": "function fn1(a, b) { return a + b; }",
    "priority": "low"
}

EXAMPLE 4 - Performance:
Code:
for(let i = 0; i < users.length; i++) {
    const user = await db.findById(users[i].id);
}

Output:
{
    "type": "performance",
    "files": ["user.controller.js"],
    "description": "Sequential DB calls inside loop cause N+1 problem",
    "suggestion": "Use Promise.all() to fetch all users in parallel",
    "codeSnippet": "for(let i = 0; i < users.length; i++) { await db.findById... }",
    "priority": "high"
}

Now analyze this real codebase and find all issues:
${codeContext}

Return ONLY this JSON format, nothing else:
{
    "suggestions": [
        {
            "type": "duplicate | complexity | naming | performance",
            "files": ["filename.js"],
            "description": "what is the problem",
            "suggestion": "how to fix it",
            "codeSnippet": "problematic code",
            "priority": "high | medium | low"
        }
    ]
}
`;

    const result = await model.generateContent(prompt);

    let parsed;
    try {
      const cleaned = result.response
        .text()
        .replace(/```json|```/g, "")
        .trim();
      console.log("===== GEMINI RESPONSE =====");
      console.log(cleaned);
      console.log("===========================");
      parsed = JSON.parse(cleaned);

      if (Array.isArray(parsed)) {
        parsed = {
          suggestions: parsed,
        };
      }
    } catch (e) {
      return res
        .status(500)
        .json({ success: false, message: "AI response invalid" });
    }

    if (!parsed?.suggestions || !Array.isArray(parsed.suggestions)) {
      return res
        .status(500)
        .json({ success: false, message: "AI returned invalid format" });
    }

    const suggestions = parsed.suggestions.map((s) => ({
      repoId,
      userId: req.userId,
      type: s.type,
      files: s.files,
      description: s.description,
      suggestion: s.suggestion,
      codeSnippet: s.codeSnippet,
      priority: s.priority,
    }));

    await Refactor.insertMany(suggestions);
    await User.findByIdAndUpdate(req.userId, {
      $inc: {
        "usage.totalRequests": 1,
        "usage.remainingCredits": -1,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Suggestions generated",
      suggestions,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "server error",
    });
  }
};

export const getSuggestions = async (req, res) => {
  try {
    const { repoId } = req.params;
    const refactor = await Refactor.find({ repoId });
    if (!refactor) {
      return res.status(400).json({
        success: false,
        message: "repo not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "suggestion find successfully",
      refactor,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "suggestion server error",
      refactor,
    });
  }
};

export const applySuggestion = async (req, res) => {
  try {
    const { suggestionId } = req.params;
    const suggestion = await Refactor.findByIdAndUpdate(
      suggestionId,
      { status: "applied" },
      { new: true },
    );
    if (!suggestion) {
      return res.status(404).json({
        success: false,
        message: "suggestion not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "suggestion applied successfully",
      suggestion,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "applySuggestion server error",
    });
  }
};

export const ignoreSuggestion = async (req, res) => {
  try {
    const { suggestionId } = req.params;
    const suggestion = await Refactor.findByIdAndUpdate(
      suggestionId,
      { status: "ignored" },
      { new: true },
    );
    if (!suggestion) {
      return res.status(404).json({
        success: false,
        message: "suggestion not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "suggestion ignored successfully",
      suggestion,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "applySuggestion server error",
    });
  }
};
