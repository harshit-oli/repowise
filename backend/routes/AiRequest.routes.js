import express from "express"
import isAuth from "../middleware/auth.middleware.js";
import { getLogById, getLogs, getUsage } from "../controllers/AiRequest.controller.js";

const AiRequestRouter=express.Router();

AiRequestRouter.get("/getLogs",isAuth,getLogs)
AiRequestRouter.get("/getUsage",isAuth,getUsage)
AiRequestRouter.get("/getLogById/:logId",isAuth,getLogById)

export default AiRequestRouter;

