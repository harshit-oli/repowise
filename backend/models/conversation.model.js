import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
    repoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Repo"
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    title: {
        type: String,
        default: "New Chat"
    },
}, { timestamps: true })

const Conversation = mongoose.model("Conversation", conversationSchema);
export default Conversation;