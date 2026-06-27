import mongoose from "mongoose";

const refactorSchema = new mongoose.Schema(
  {
    repoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Repo",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    type: {
      type: String,
      required: true,
    },
    files: [
      {
        type: String,
      },
    ],
    description: {
      type: String,
    },
    suggestion: {
      type: String,
    },
    codeSnippet: {
      type: String,
    },
    priority: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["pending", "applied", "ignored"],
      default: "pending",
    },
  },
  { timestamps: true },
);

const Refactor = mongoose.model("Refactor", refactorSchema);
export default Refactor;
