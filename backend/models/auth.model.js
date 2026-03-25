    import mongoose from "mongoose"

    const authSchema=new mongoose.Schema({
        name:{
            type:String,
            required:true
        },
        email:{
        type:String,
        required:true,
        },
        password:{
            type:String,
            required:true,
        },
        profileImage:{
            type:String,
        },
        resetOtp:{
            type:String,
        },
         resetPassOtp:{
            type:String,
        },
        otpExpires:{
            type:Date,
        },
        isOtpVerified:{
            type:Boolean,
            default:false,
        },
        isVerified:{
            type:Boolean,
            default:false,
        },
        githubId:{
            type:String,
        },
        githubUserName:{
            type:String,
        },
        githubAccessToken:{
            type:String,
        },
        repos:[
            {
                repoName:String,
                repoUrl:String,
                lastAnalyzed:Date,
            }
        ],
        usage:{
            totalRequests:Number,
            remainingCredits:Number,
            planType:String,
        },
        refreshToken:String
    },{timestamps:true})

    const User=mongoose.model("User",authSchema);
    export default User