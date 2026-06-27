import { createSlice } from "@reduxjs/toolkit";

const refactorSlice = createSlice({
    name: "refactor",
    initialState: {
        suggestions: null,
    },
    reducers: {
        setSuggestions: (state, action) => {
            state.suggestions = action.payload;
        }
    }
})

export const { setSuggestions } = refactorSlice.actions;
export default refactorSlice.reducer;