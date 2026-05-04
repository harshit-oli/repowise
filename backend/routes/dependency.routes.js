import express from "express";
import isAuth from "../middleware/auth.middleware.js";
import { generateGraph } from "../controllers/dependency.controller.js";
import {
  getGraph,
  getNodeDependencies,
} from "../controllers/dependency.controller.js";
const dependencyRouter = express.Router();

dependencyRouter.post("/generateGraph/:repoId", isAuth, generateGraph);
dependencyRouter.get("/getGraph/:repoId", isAuth, getGraph);
dependencyRouter.get("/nodeGraph/:repoId/:fileId", isAuth, getNodeDependencies);

export default dependencyRouter;
