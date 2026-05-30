import { createSlice } from "@reduxjs/toolkit";

const repoSlice = createSlice({
  name: "repo",
  initialState: {
    repoData: null,
    selectedRepo: null,
  },
  reducers: {
    setRepoData: (state, action) => {
      state.repoData = action.payload;
    },
    setselectedRepo: (state, action) => {
      state.selectedRepo = action.payload;
    },
  },
});

export const { setRepoData, setselectedRepo } = repoSlice.actions;
export default repoSlice.reducer;
