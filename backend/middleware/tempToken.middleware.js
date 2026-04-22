import jwt from "jsonwebtoken";

export const isOtpValid = (req, res, next) => {
  try {
    const token = req.cookies.otpToken;

    if (!token) {
      return res.status(401).json({ message: "No OTP session" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.userId;

    next();
  } catch (err) {
    return res.status(401).json({ message: "OTP expired" });
  }
};