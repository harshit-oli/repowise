import express from "express";
import isAuth from "../middleware/auth.middleware.js";
import {
  clearChat,
  createConversation,
  deleteConversation,
  getChatHistory,
  getConversations,
  sendMessage,
} from "../controllers/chat.controller.js";

const chatRouter = express.Router();

chatRouter.post("/sendMessage/:repoId", isAuth, sendMessage);
chatRouter.get(
  "/getChatHistory/:repoId/:conversationId",
  isAuth,
  getChatHistory,
);
chatRouter.delete("/clearChat/:repoId/:conversationId", isAuth, clearChat);
chatRouter.post("/createConversation/:repoId", isAuth, createConversation);
chatRouter.get("/getConversations/:repoId", isAuth, getConversations);
chatRouter.delete(
  "/deleteConversation/:conversationId",
  isAuth,
  deleteConversation,
);

export default chatRouter;
