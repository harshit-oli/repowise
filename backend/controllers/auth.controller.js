import bcrypt from "bcryptjs";
import User from "../models/auth.model.js";
import genToken from "../config/token.js";
import sendMail from "../config/Mail.js";
import jwt from "jsonwebtoken";

export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Please Enter valid email",
      });
    }
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    user.resetPassOtp = otp;
    ((user.otpExpires = Date.now() + 5 * 60 * 1000),
      (user.isOtpVerified = false),
      await user.save());
    await sendMail(email, otp);

    return res.status(200).json({
      success: true,
      message: "email successfully send",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "server otp error",
    });
  }
};

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    let user = await User.findOne({ email });

    // User exists karta h but vo verified nhi h to
    if (user) {
      if (user.isVerified) {
        return res.status(400).json({ message: "User already exists" });
      }

      if (user.otpExpires && user.otpExpires > Date.now()) {
        return res.status(400).json({
          message: "Wait before requesting new OTP",
        });
      }

      // resend OTP karo
      const otp = Math.floor(1000 + Math.random() * 9000).toString();

      user.resetOtp = otp;
      user.otpExpires = Date.now() + 5 * 60 * 1000;
      await user.save();

      // temp token
      const tempToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: "15m",
      });

      res.cookie("otpToken", tempToken, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        maxAge: 15 * 60 * 1000,
      });

      console.log("OTP:", otp);
      await sendMail(user.email, otp);

      return res.json({ message: "OTP resent" });
    }

    // New user bnaya  yha maine agar user phle se present nhi h
    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    user = await User.create({
      name,
      email,
      password: hashedPassword,
      resetOtp: otp,
      otpExpires: Date.now() + 5 * 60 * 1000,
      isVerified: false,
    });

    // temp token
    const tempToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    res.cookie("otpToken", tempToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    console.log("OTP:", otp);
    await sendMail(user.email, otp);

    res.json({ message: "User registered, OTP sent" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const verifyRegisterOtp = async (req, res) => {
  try {
    const userId = req.userId; // ye middleware se aa raha hai reeee
    const { otp } = req.body;

    const user = await User.findById(userId);

    if (
      !user ||
      user.resetOtp !== otp.toString() ||
      user.otpExpires < Date.now()
    ) {
      return res.status(400).json({
        success: false,
        message: "invalid or expired otp",
      });
    }

    // verify kiya user ko
    user.isVerified = true;
    user.resetOtp = undefined;
    user.otpExpires = undefined;

    await user.save();

    // ye h real login token
    const token = await genToken(user._id);
    res.clearCookie("otpToken");

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      secure: false,
      sameSite: "strict",
    });

    // password remove kiya yha se
    const { password, ...safeUser } = user.toObject();

    return res.status(200).json({
      success: true,
      message: "otp verified",
      user: safeUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "verify otp error",
    });
  }
};

export const verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user || user.resetPassOtp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "invalid or expired otp",
      });
    }
    user.isOtpVerified = true;
    user.resetPassOtp = undefined;
    user.otpExpires = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "otp verified",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "verify otp error",
    });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "all fields are required",
    });
  }
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({
      success: false,
      message: "user not found",
    });
  }
  if (!user.isVerified) {
    return res.status(400).json({
      success: false,
      message: "Please verify your email first",
    });
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({
      success: false,
      message: "password does not match",
    });
  }
  const token = await genToken(user._id);

  res.cookie("token", token, {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    secure: false,
    sameSite: "strict",
  });

  return res.status(200).json({
    success: true,
    message: "login successfully",
    user,
  });
};
export const logout = async (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).json({
      success: true,
      message: "logout successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "user not found",
      });
    }
    const user = await User.findById(userId).select("-password");
    return res.status(200).json({
      success: true,
      message: "profile find successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "profile internal server error",
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "all fields are required",
      });
    }
    const user = await User.findOne({ email });
    if (!user || !user.isOtpVerified) {
      return res.status(403).json({
        success: false,
        message: "Otp verification is required",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.isOtpVerified = false;
    await user.save();
    return res.status(200).json({
      success: true,
      message: "password reset successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "resetPassword internal server error",
    });
  }
};

export const againOtp = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.otpExpires && user.otpExpires > Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP abhi valid hai, expire hone ka wait karo",
      });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    user.resetOtp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    await user.save();

    await sendMail(user.email, otp);

    return res.status(200).json({
      success: true,
      message: "OTP resent successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
