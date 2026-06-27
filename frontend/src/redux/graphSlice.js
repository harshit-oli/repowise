import { createSlice } from "@reduxjs/toolkit";

const dependencySlice = createSlice({
  name: "dependency",
  initialState: {
    graphData: null,
    nodeData: null, // getNodeDependencies ka response
  },
  reducers: {
    setGraphData: (state, action) => {
      state.graphData = action.payload;
    },
    setNodeData: (state, action) => {
      state.nodeData = action.payload;
    },
  },
});

export const { setGraphData, setNodeData } = dependencySlice.actions;
export default dependencySlice.reducer;
