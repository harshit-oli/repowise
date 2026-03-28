import express from "express"
import { getAnalysis, getStatus, startAnalysis } from "../controllers/Analysis.controller";
import isAuth from "../middleware/auth.middleware";

const AnalysisRouter=express.Router();

AnalysisRouter.post("/startAnalysis",isAuth,startAnalysis);
AnalysisRouter.get("/getAnalysis",isAuth,getAnalysis);
AnalysisRouter.get("/getStatus",isAuth,getStatus);

export default AnalysisRouter;