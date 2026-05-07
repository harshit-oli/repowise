import mongoose from "mongoose";

const CommitHistorySchema = new mongoose.Schema(
  {
    repoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Repo",
    },
    commits: [
      {
        message: { type: String },
        author: { type: String },
        date: { type: Date },
        sha: { type: String },
        filesChanged: [{ type: String }],
        diff: { type: String },
      },
    ],
  },
  { timestamps: true },
);

const CommitHistory = mongoose.model("CommitHistory", CommitHistorySchema);
export default CommitHistory;
