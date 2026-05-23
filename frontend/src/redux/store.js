import {configureStore} from "@reduxjs/toolkit"
import userSlice from "./userSlice"
import securitySlice from "./securitySlice"

const store=configureStore({
    reducer:{
        user:userSlice,
        security:securitySlice
    }
})

export default store;