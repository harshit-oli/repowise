import CommitHistory from "../models/CommitHistory.model.js";
import Repo from "../models/repo.model.js";
import { Octokit } from "@octokit/rest";

export const fetchHistory=async(req,res)=>{
try {
        const {repoId}=req.params;
    const repo= await Repo.findById(repoId);
    if(!repo){
        return res.status(404).json({
            success:false,
            message:"repo not found",
        })
    }
    const findUrlInfo=repo.repoUrl.split("/");
        const owner = findUrlInfo[3];
    
        const octokit = new Octokit({
            auth: process.env.GITHUB_TOKEN,  
        });
       const commits = [];

const { data } = await octokit.repos.listCommits({
    owner,
    repo: repo.repoName,
    per_page: 10
});

for(const commit of data) {
    const { data: commitDetail } = await octokit.repos.getCommit({
        owner,
        repo: repo.repoName,
        ref: commit.sha  //ye btata h ki kis specific commit ki details laani h
    });
    
    commits.push({
        sha: commit.sha,
        message: commit.commit.message,
        author: commit.commit.author.name,
        date: commit.commit.author.date,
        filesChanged: commitDetail.files.map(f => f.filename),
        diff: commitDetail.files.map(f => f.patch).join("\n\n")
    });
}

const fetchedHistory=await CommitHistory.create({
    repoId,
    commits,
})

return res.status(200).json({
    success:true,
    message:"history fetched successfully",
    fetchedHistory
})
} catch (error) {
    return res.status(500).json({
        success:false,
        message:"fetchedHistory server error",
    })
}
}

export const getHistory=async(req,res)=>{
    try {
        const {repoId}=req.params;

        const repo=await Repo.findById(repoId);

        if(!repo){
            return res.status(404).json({
                success:false,
                message:"repo not found",
            })
        }
        const history=await CommitHistory.findOne({repoId});
        if(!history){
        return res.status(404).json({
            success: false,
            message: "No commit history found, please fetch first"
        })
        }

        return res.status(200).json({
            success:true,
            message:"commits find successfully",
            history,
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"getHistory server error",
        })
    }
}