import Repo from "../models/repo.model";

export const addRepo=async(req, res)=>{
   try {
     const {repoUrl}=req.body;
     const userId=req.userId;
    if(!repoUrl){
        return res.status(403).json({
            success:false,
            message:"repoUrl not found",
        })
    }
    if(!repoUrl.startsWith("https://github.com/")){
      return res.status(400).json({
        success:false,
        message:"repoUrl is wrong",
      })
    }
    const repo=await Repo.findOne({repoUrl,userId});
    if(repo){
        return res.status(400).json({
            success:false,
            message:'repo already exist',
        })
    }

   } catch (error) {
     return res.status(500).json({
        success:false,
        message:"repo server error",
     })
   }
}