import express from "express";
import {
  getIssuesByFile,
  getScanResult,
  startScan,
} from "../controllers/security.controller.js";
import isAuth from "../middleware/auth.middleware.js";

const securityRouter = express.Router();

securityRouter.post("/startScan/:repoId", isAuth, startScan);
securityRouter.get("/scanResult/:repoId", isAuth, getScanResult);
securityRouter.get("/issueFile/:repoId/:fileName", isAuth, getIssuesByFile);

export default securityRouter;
