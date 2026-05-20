import express from "express";
import {
  againOtp,
  getProfile,
  login,
  logout,
  register,
  resetPassword,
  sendOtp,
  verifyRegisterOtp,
  verifyResetOtp,
   githubLogin,
  githubCallback,
  connectGithub,
} from "../controllers/auth.controller.js";
import isAuth from "../middleware/auth.middleware.js";
import { isOtpValid } from "../middleware/tempToken.middleware.js";
import passport from "passport";
const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/verifyRegisterOtp", isOtpValid, verifyRegisterOtp);
authRouter.post("/verifyResetOtp", verifyResetOtp);
authRouter.post("/sendOtp", sendOtp);
authRouter.get("/logout", logout);
authRouter.get("/getProfile", isAuth, getProfile);
authRouter.post("/resetPassword", resetPassword);
authRouter.get("/againOtp", isOtpValid, againOtp);
authRouter.get("/github", githubLogin);
authRouter.get("/github/callback", 
    passport.authenticate("github", { failureRedirect: "http://localhost:5173/login"}),
    githubCallback
);
authRouter.get("/github/connect", isAuth,
    (req, res, next) => {
        req.session.userId = req.userId 
        next()
    },
    passport.authenticate("github", { scope: ["user:email"] })
);
authRouter.get("/github/connect/callback",
    passport.authenticate("github", { failureRedirect: "http://localhost:5173/login"}),
    connectGithub
);

export default authRouter;
