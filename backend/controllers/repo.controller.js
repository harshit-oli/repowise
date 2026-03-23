import User from "../models/auth.model.js";
import Repo from "../models/repo.model.js";
import { Octokit } from "@octokit/rest"
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

    const findUrlInfo=repoUrl.split("/");
    const owner = findUrlInfo[3];
    const repoName = findUrlInfo[4];
    const octokit = new Octokit();

    const {data} =await octokit.repos.get({
        owner,
        repo:repoName,
    })

    const repoAdd=await Repo.create({
        userId,
        repoUrl,
        repoName:data.name,
        language:data.language,
        stars: data.stargazers_count,
        forks: data.forks_count,
        size: data.size,
        defaultBranch: data.default_branch,
        status: "pending",
    })

    await User.findByIdAndUpdate(userId,{
        $push:{
            repos:{
            repoName: data.name,
            repoUrl: repoUrl,
            }
        }
    })
    return res.status(200).json({
        success:true,
        message:"repo added successfully",
        repoAdd,
    })
   } catch (error) {
     return res.status(500).json({
        success:false,
        message:"repo server error",
     })
   }
}

export const getRepos = async(req,res)=>{
   try {
     const userId=req.userId;
    const repos=await Repo.find({userId});
     if(!repos || repos.length === 0){
        return res.status(400).json({
            success:false,
            message:"No repos found"
        })
     }
     return res.status(200).json({
        success:true,
        message:"repos find successfully",
        repos,
     })
   } catch (error) {
    return res.status(500).json({
        success:false,
        message:"getRepo server error",
    })
   }
}

    export const getRepoById=async(req, res)=>{
        try {
            const {repoId}=req.params;

        const repo=await Repo.findById(repoId);
        if(!repo){
            return res.status(400).json({
                success:false,
                message:"repo not exist",
            })
        }

        if(req.userId!==repo.userId.toString()){
        return res.status(400).json({
            success:false,
            message:"Unauthorized",
        })
        }
        return res.status(200).json({
            success:true,
            message:"Repo find successfully",
            repo,
        })
        } catch (error) {
            return res.status(500).json({
            success:false,
            message:"repoId server error",
        }) 
        }
    }

    export const deleteRepo=async(req, res)=>{
       try {
         const {repoId}=req.params;
         const userId=req.userId;
        const repo=await Repo.findById(repoId);
        if(!repo){
            return res.status(400).json({
                success:false,
                message:"repo not found",
            })
        }
        if(repo.userId.toString() !== userId){
            return res.status(403).json({
                success:false,
                message:"unauthorized",
            })
        } 
        await Repo.findByIdAndDelete(repoId);
        await User.findByIdAndUpdate(userId,{ 
            $pull: {
                repos: {repoUrl:repo.repoUrl}
            }
        });
        // await Analysis.deleteMany({ repoId })
        // await AIRequest.deleteMany({ repoId })
        return res.status(200).json({
            success:true,
            message:"repo deleted successfully",
        })
       } catch (error) {
        return res.status(500).json({
            success:false,
            message:"deleter server related error",
        })
       }
    }