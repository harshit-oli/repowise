import { createSlice } from "@reduxjs/toolkit";

const fileSlice = createSlice({
    name: "file",
    initialState: {
        filesData: null,
        selectedFile: null,
    },
    reducers: {
        setFilesData: (state, action) => {
            state.filesData = action.payload;
        },
        setSelectedFile: (state, action) => {
            state.selectedFile = action.payload;
        }
    }
})

export const { setFilesData, setSelectedFile } = fileSlice.actions;
export default fileSlice.reducer;