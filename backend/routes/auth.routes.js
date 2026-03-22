import express from "express"
import { getProfile, login, logout, register, resetPassword, sendOtp, verifyRegisterOtp, verifyResetOtp } from "../controllers/auth.controller.js";
import isAuth from "../middleware/auth.middleware.js";
const authRouter=express.Router();

authRouter.post("/register",register);
authRouter.post("/login",login);
authRouter.post("/verifyRegisterOtp",verifyRegisterOtp);
authRouter.post("/verifyResetOtp",verifyResetOtp);
authRouter.post("/sendOtp",sendOtp);
authRouter.post("/logout",logout);
authRouter.get("/getProfile",isAuth,getProfile);
authRouter.post("/resetPassword",resetPassword);

export default authRouter;