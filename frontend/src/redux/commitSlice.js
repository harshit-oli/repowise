import { createSlice } from "@reduxjs/toolkit";

const commitSlice = createSlice({
    name: "commit",
    initialState: {
        historyData: null,      
        commitDetail: null,     
        timeMachineResult: null 
    },
    reducers: {
        setHistoryData: (state, action) => {
            state.historyData = action.payload;
        },
        setCommitDetail: (state, action) => {
            state.commitDetail = action.payload;
        },
        setTimeMachineResult: (state, action) => {
            state.timeMachineResult = action.payload;
        }
    }
})

export const { setHistoryData, setCommitDetail, setTimeMachineResult } = commitSlice.actions;
export default commitSlice.reducer;