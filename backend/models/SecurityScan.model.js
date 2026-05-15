import mongoose from "mongoose";

const SecurityScanSchema = new mongoose.Schema(
  {
    repoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Repo",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    issues: [
      {
        severity: {
          type: String,
          enum: ["critical", "high", "medium", "low"],
        },
        file: {
          type: String,
        },
        line: {
          type: Number,
        },
        description: {
          type: String,
        },
        suggestion: {
          type: String,
        },
        codeSnippet: { 
          type: String 
        },
        fixedCode: { 
          type: String
        }, 
      },
    ],
    severity: {
      type: String,
      enum: ["critical", "high", "medium", "low"],
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ["scanning", "completed", "failed"],
    },
  },
  { timestamps: true },
);

const Security = mongoose.model("Security", SecurityScanSchema);
export default Security;
