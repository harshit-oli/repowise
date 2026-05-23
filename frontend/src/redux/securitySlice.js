import { createSlice } from "@reduxjs/toolkit";

const securitySlice=createSlice({
    name:"security",
    initialState:{
      scanData: null,
      issuesData: null,
    },

    reducers:{
        setScanData:(state,action)=>{
            state.scanData=action.payload;
        },
        setIssuesData:(state,action)=>{
             state.issuesData=action.payload;
        }
    }
})  
export const {setScanData, setIssuesData} = securitySlice.actions;
export default securitySlice.reducer;