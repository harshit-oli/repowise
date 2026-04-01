import express from "express"
import { getAnalysis, getStatus, reAnalyze, startAnalysis } from "../controllers/Analysis.controller.js";
import isAuth from "../middleware/auth.middleware.js";

const AnalysisRouter=express.Router();

AnalysisRouter.post("/startAnalysis/:repoId",isAuth,startAnalysis);
AnalysisRouter.get("/getAnalysis/:repoId",isAuth,getAnalysis);
AnalysisRouter.get("/getStatus/:repoId",isAuth,getStatus);
AnalysisRouter.post("/reAnalyze/:repoId",isAuth,reAnalyze);
export default AnalysisRouter;