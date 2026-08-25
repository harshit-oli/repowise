import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./userSlice";
import securitySlice from "./securitySlice";
import repoSlice from "./repoSlice";
import commitSlice from "./commitSlice";
import analysisSlice from "./analysis";
import fileSlice from "./fileSlice";
import dependencySlice from "./graphSlice";
import chatSlice from "./chatSlice";
import refactorSlice from "./refactorSlice";
import teamSlice from "./teamSlice";

const store = configureStore({
  reducer: {
    user: userSlice,
    repo: repoSlice,
    security: securitySlice,
    commits: commitSlice,
    analysis: analysisSlice,
    file: fileSlice,
    dependency: dependencySlice,
    chat: chatSlice,
    refactor: refactorSlice,
    team: teamSlice,
  },
});

export default store;
