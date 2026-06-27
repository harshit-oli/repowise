import express from "express";
import isAuth from "../middleware/auth.middleware.js";
import {
  applySuggestion,
  generateSuggestions,
  getSuggestions,
  ignoreSuggestion,
} from "../controllers/refector.controller.js";

const refectorRouter = express.Router();

refectorRouter.post(
  "/generateSuggestions/:repoId",
  isAuth,
  generateSuggestions,
);
refectorRouter.get("/getSuggestions/:repoId", isAuth, getSuggestions);
refectorRouter.patch("/applySuggestion/:suggestionId", isAuth, applySuggestion);
refectorRouter.patch(
  "/ignoreSuggestion/:suggestionId",
  isAuth,
  ignoreSuggestion,
);

export default refectorRouter;
