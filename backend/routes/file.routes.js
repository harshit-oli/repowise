import express from "express"

import isAuth from "../middleware/auth.middleware.js";
import { generateEmbeddings, generateFileSummaries, getFileById, getFileSummaries, searchFiles } from "../controllers/file.controller.js";

const fileRouter=express.Router();

fileRouter.post("/generateFile/:repoId",isAuth,generateFileSummaries);
fileRouter.get("/getFileSummaries/:repoId",isAuth,getFileSummaries);
fileRouter.get("/getFileById/:fileId",isAuth,getFileById);
fileRouter.post("/searchFiles/:repoId",isAuth,searchFiles);
fileRouter.post("/generateEmbeddings/:repoId",isAuth,generateEmbeddings);
export default fileRouter;