import { createSlice } from "@reduxjs/toolkit";

const analysisSlice = createSlice({
  name: "analysis",
  initialState: {
    analysisData: null,
  },
  reducers: {
    setAnalysisData: (state, action) => {
      state.analysisData = action.payload;
    },
  },
});

export const { setAnalysisData } = analysisSlice.actions;
export default analysisSlice.reducer;
