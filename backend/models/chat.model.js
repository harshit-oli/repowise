import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  repoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Repo",
  },
  role: {
    type: String,
    enum: ["User", "Assistant"],
  },
  content: {
    type: String,
  },
  context: [
    {
      type: String,
    },
  ],
  tokenUsed: {
    type: Number,
  },
},{timestamps: true});

const Chat = mongoose.model("Chat", chatSchema);
export default Chat;
