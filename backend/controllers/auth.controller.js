import bcrypt from "bcryptjs";
import User from "../models/auth.model.js";
import genToken from "../config/token.js";
import sendMail from "../config/Mail.js";



export const sendOtp=async(req,res)=>{
    try {
        const {email}=req.body;
        const user=await User.findOne({email});
        if(!user){
            return res.status(400).json({
                success:false,
                message:"Please Enter valid email",
            })
        }
        const otp=Math.floor(1000+Math.random()*9000).toString();
        user.resetOtp=otp;
        user.otpExpires=Date.now() + 5*60*1000,
        user.isOtpVerified=false,
        await user.save();
        await sendMail(email,otp);

        return res.status(200).json({
            success:true,
             message:"email successfully send",
        })
    } catch (error) {
         return res.status(500).json({
            success:false,
            message:"server otp error",
        })
    }
}

export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        const findByEmail = await User.findOne({ email });
        if (findByEmail) {
            return res.status(400).json({
                success: false,
                message: "User already exist",
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be more than 6 characters",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            isVerified: false,
        });
        

        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        user.resetOtp = otp;
        user.otpExpires = Date.now() + 5 * 60 * 1000;
        await user.save();

        await sendMail(email, otp);

        return res.status(201).json({
            success: true,
            message: "OTP sent to your email",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const verifyRegisterOtp=async(req,res)=>{
    try {
        const {email,otp}=req.body;

        const user = await User.findOne({email});
        if(!user || user.resetOtp !== otp || user.otpExpires < Date.now()){
            return res.status(400).json({
             success:false,
            message:"invalid or expired otp",
            })
        }
        user.isVerified=true;
        user.resetOtp=undefined;
        user.otpExpires=undefined;

        await user.save();
        const token=await genToken(user._id);

        res.cookie("token",token,{
            httpOnly:true,
            maxAge:24*60*60*1000,
            secure:false,
            sameSite:"strict"
        })

        return res.status(200).json({
            success:true,
            message:"otp verified"
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"verify otp error"
        })
    }   
}

export const verifyResetOtp=async(req,res)=>{
    try {
        const {email,otp}=req.body;

        const user = await User.findOne({email});
        if(!user || user.resetOtp !== otp || user.otpExpires < Date.now()){
            return res.status(400).json({
             success:false,
            message:"invalid or expired otp",
            })
        }
        user.isOtpVerified=true;
        user.resetOtp=undefined;
        user.otpExpires=undefined;

        await user.save();

        return res.status(200).json({
            success:true,
            message:"otp verified"
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"verify otp error"
        })
    }   
}

export const login=async(req,res)=>{
   const {email,password}=req.body;

   if(!email || !password){
    return res.status(400).json({
        success:false,
        message:"all fields are required",
    })
   }
   const user=await User.findOne({email});
   if(!user){
    return res.status(400).json({
        success:false,
        message:"user not found",
    })
   }
   if (!user.isVerified) {
    return res.status(400).json({
        success: false,
        message: "Please verify your email first",
    })
}
   const isMatch=await bcrypt.compare(password,user.password);
   if(!isMatch){
    return res.status(400).json({
        success:false,
        message:"password does not match",
    })
   }
     const token=await genToken(user._id);

        res.cookie("token",token,{
            httpOnly:true,
            maxAge:24*60*60*1000,
            secure:false,
            sameSite:"strict"
        })

        return res.status(200).json({
            success:true,
            message:"login successfully",
            user,
        })

} 
export const logout=async(req,res)=>{
   try {
     res.clearCookie("token");
    res.status(200).json({
        success:true,
        message:'logout successfully',
    })
   } catch (error) {
    res.status(500).json({
        success:false,
        message:"internal server error"
    })
   }
}

export const getProfile=async(req, res)=>{
   try {
     const userId=req.userId;
    if(!userId){
        return res.status(401).json({
            success:false,
            message:"user not found",
        });
    }
      const user = await User.findById(userId).select("-password");
    return res.status(200).json({
        success:true,
        message:"profile find successfully",
        user,
    })
   } catch (error) {
    return res.status(500).json({
        success:false,
        message:"profile internal server error",
    })
   }
}   

export const resetPassword=async(req,res)=>{
    try {
        const {email,password}=req.body;
    if(!email || !password){
        return res.status(400).json({
            success:false,
            message:"all fields are required"
        })
    }
    const user=await User.findOne({email});
    if(!user || !user.isOtpVerified){
        return res.status(403).json({
            success:false,
            message:"Otp verification is required",
        })
    }
    const hashedPassword=await bcrypt.hash(password,10);
    user.password=hashedPassword;
    user.isOtpVerified = false;
    await user.save();
    return res.status(200).json({
        success:true,
        message:'password reset successfully',
    })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"resetPassword internal server error", 
        })
    }
}