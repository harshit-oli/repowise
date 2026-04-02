import AiRequest from "../models/AIRequest.model.js"
import User from "../models/auth.model.js"

export const getLogs=async(req,res)=>{
   try {
    const logs=await AiRequest.find({userId:req.userId}).sort({createdAt:-1})
    return res.status(200).json({
        success:true,
        message:"logs get successfully",
        logs,
    })
   } catch (error) {
    return res.status(500).json({
        success:false,
        message:"getLogs server error",
    })
   }
} 

export const getUsage=async(req,res)=>{
    try {
       const user=await User.findById(req.userId).select("usage");
       if(!user){
       return res.status(404).json({
        success: false,
        message: "User not found"
        })
       }
       return res.status(200).json({
        success:true,
        message:"usage data successfully",
        usage:user.usage,
       })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"usage server error",
        })
    }
}

export const getLogById=async(req,res)=>{
  try {
      const {logId}=req.params;
    const log=await AiRequest.findById(logId);
    
    if(!log){
        return res.status(400).json({
            success:false,
            message:"log not found",
        })
    }
    if(log.userId.toString() !== req.userId){
    return res.status(403).json({
        success: false,
        message: "Unauthorized"
    })
}
return res.status(200).json({
    success: true,
    log
})
  } catch (error) {
    return res.status(500).json({
        success: false,
        message: "getLogById server error"
    })
  }
}