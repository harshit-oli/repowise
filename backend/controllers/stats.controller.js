import Repo from "../models/repo.model.js";
import Security from "../models/SecurityScan.model.js";

export const getStats=async(req,res)=>{
    try {
        const totalRepos = await Repo.countDocuments();

       const securityStats = await Security.aggregate([
    {
        $group: {
            _id: null,
            totalIssues: { $sum: { $size: "$issues" } },
            avgScore: { $avg: "$score" },
            avgScanTime: { $avg: { $subtract: ["$updatedAt", "$createdAt"] } }
        }
    }
    ]) 

    return res.status(200).json({
        success:true,
        message:"getState find successfully",
        totalRepos,
        securityStats
    })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"getStats server error",
        })
    }
}