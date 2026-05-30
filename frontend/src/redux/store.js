import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./userSlice";
import securitySlice from "./securitySlice";
import repoSlice from "./repoSlice";
import commitSlice from "./commitSlice";

const store = configureStore({
  reducer: {
    user: userSlice,
    repo: repoSlice,
    security: securitySlice,
    commits: commitSlice,
  },
});

export default store;
