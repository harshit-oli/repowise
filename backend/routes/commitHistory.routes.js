import express from "express";

import isAuth from "../middleware/auth.middleware.js";
import {
  analyzeCommit,
  fetchHistory,
  getHistory,
  getTimeMachineHistory,
  timeMachineQuery,
} from "../controllers/commitHistory.controller.js";

const commitHistoryRouter = express.Router();

commitHistoryRouter.post("/fetchHistory/:repoId", isAuth, fetchHistory);
commitHistoryRouter.get("/getHistory/:repoId", isAuth, getHistory);
commitHistoryRouter.get("/analyzeCommit/:repoId/:sha", isAuth, analyzeCommit);
commitHistoryRouter.post("/timeMachineQuery/:repoId", isAuth, timeMachineQuery);
commitHistoryRouter.get(
  "/getTimeMachineHistory/:repoId",
  isAuth,
  getTimeMachineHistory,
);
export default commitHistoryRouter;
