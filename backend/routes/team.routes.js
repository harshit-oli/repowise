import express from "express";
import isAuth from "../middleware/auth.middleware.js";
import {
  createTeam,
  joinTeam,
  getTeam,
  addMember,
  removeMember,
  getTeamRepos,
  deleteTeam,
} from "../controllers/team.controller.js";

const teamRouter = express.Router();

teamRouter.post("/createTeam", isAuth, createTeam);
teamRouter.post("/joinTeam", isAuth, joinTeam);
teamRouter.get("/getTeam/:teamId", isAuth, getTeam);
teamRouter.post("/addMember/:teamId", isAuth, addMember);
teamRouter.delete("/removeMember/:teamId/:memberId", isAuth, removeMember);
teamRouter.get("/getTeamRepos/:teamId", isAuth, getTeamRepos);
teamRouter.delete("/deleteTeam/:teamId", isAuth, deleteTeam);

export default teamRouter;
