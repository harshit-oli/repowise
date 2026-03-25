import express from "express"
import isAuth from "../middleware/auth.middleware.js";
import { addRepo, deleteRepo, getRepoById, getRepos } from "../controllers/repo.controller.js";

const repoRouter=express.Router();

repoRouter.post("/addRepo",isAuth,addRepo);
repoRouter.get("/getRepos",isAuth,getRepos);
repoRouter.get("/getRepo/:repoId",isAuth,getRepoById);
repoRouter.get("/delete/:repoId",isAuth,deleteRepo);

export default repoRouter;