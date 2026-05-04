import express from "express";
import isAuth from "../middleware/auth.middleware.js";
import {
  clearChat,
  getChatHistory,
  sendMessage,
} from "../controllers/chat.controller.js";

const chatRouter = express.Router();

chatRouter.post("/sendMessage/:repoId", isAuth, sendMessage);
chatRouter.get("/getChatHistory/:repoId", isAuth, getChatHistory);
chatRouter.delete("/clearChat/:repoId", isAuth, clearChat);

export default chatRouter;
