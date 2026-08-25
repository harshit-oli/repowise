import { createSlice } from "@reduxjs/toolkit";

const teamSlice = createSlice({
    name: "team",
    initialState: {
        teamData: null,
        teamRepos: null,
    },
    reducers: {
        setTeamData: (state, action) => {
            state.teamData = action.payload;
        },
        setTeamRepos: (state, action) => {
            state.teamRepos = action.payload;
        }
    }
});

export const { setTeamData, setTeamRepos } = teamSlice.actions;
export default teamSlice.reducer;