import { Octokit } from "@octokit/rest";
import Repo from "../models/repo.model.js";
import { GoogleGenerativeAI } from "@google/generative-ai"
import Analysis from "../models/Analysis.model.js";
import AiRequest from "../models/AIRequest.model.js";

    export const startAnalysis=async(req,res)=>{
        let findRepo
    try {
        const {repoId}=req.params;
        findRepo=await Repo.findById(repoId)
    if(!findRepo){
        return res.status(400).json({
            success:false,
            message:"repo not found",
        })
    }

    if(findRepo.userId.toString() !== req.userId){
        return res.status(400).json({
            success:false,
            message:"Unauthorized",
        })
    }

    findRepo.status = "processing"
    await findRepo.save()

    const findUrlInfo=findRepo.repoUrl.split("/");
    const owner = findUrlInfo[3];

    const octokit = new Octokit({
        auth: process.env.GITHUB_TOKEN, 
    });
    
    const allFiles = [];
    const getAllFiles = async (path) => {  
        const { data } = await octokit.repos.getContent({ 
            owner,
            repo: findRepo.repoName,
            path: path
        });
        for(const item of data){
            if(["node_modules", ".git", "dist", "build"].includes(item.name)){
                continue;
            }
            if (item.type === "file") {
                allFiles.push(item);
            }
            if (item.type === "dir") {
                await getAllFiles(item.path);
            }
        }
    }
    await getAllFiles("");
    const fileContents = [];

    for(const file of allFiles){
        const { data: fileData} = await octokit.repos.getContent({
            owner,
            repo: findRepo.repoName,
            path: file.path
        });
        const singleFile=Buffer.from(fileData.content, 'base64').toString()
        fileContents.push({
            fileName: file.name,     
            filePath: file.path,
            content: singleFile 
        });
    }

    const codeContext = fileContents.map(file =>
        `File: ${file.fileName}\n${file.content}`
    ).join("\n\n---\n\n");

const prompt = `
Analyze the following codebase and return ONLY a valid JSON object.
Do not include any markdown, explanation, or extra text.
Just return the raw JSON.

IMPORTANT RULES:
- Every value must be a STRING except techStack
- folderStructure must be plain text string, NOT an object or nested JSON
- techStack must be an array of strings

Return in this exact format:
{
    "summary": "what this project does in 2-3 sentences",
    "architecture": "describe system design as plain text",
    "folderStructure": "describe each folder in plain text like: backend/ contains controllers, models, routes. frontend/ contains React components",
    "apiFlow": "describe request to response flow as plain text",
    "techStack": ["tech1", "tech2"],
    "complexity": "low or medium or high"
}

Codebase:
${codeContext}
`;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        systemInstruction: `You are an expert code analyzer. 
        Always return valid JSON only. 
        Never include markdown formatting like backticks or code blocks.
        Never add any explanation outside the JSON.`
    });

    const result = await model.generateContent(prompt);
    const aiResult = JSON.parse(result.response.text());

    await AiRequest.create({
    userId: req.userId,
    repoId,
    prompt,
    response: result.response.text(),  
    tokenUsed: result.usageMetadata?.totalTokenCount || 0,  
    status: "success",
    featureType: "summary",
    modelUsed: "gemini-2.5-flash",
    });

    const analysis = await Analysis.create({
        repoId,
        userId: req.userId,
        summary: aiResult.summary,
        architecture: aiResult.architecture,
        folderStructure: aiResult.folderStructure,
        apiFlow: aiResult.apiFlow,
        techStack: aiResult.techStack,
        complexity: aiResult.complexity,
        status: "completed",
        token: result.usageMetadata?.totalTokenCount || 0,
    });
        findRepo.status = "completed";
        findRepo.errorMessage = undefined;
        findRepo.lastAnalyzed = Date.now();
        await findRepo.save();
    return res.status(200).json({
        success: true,
        message: "Analysis complete!",
        analysis,
    });

    } catch (error) {
        console.log(error.message)
        if (findRepo) {
            findRepo.status = "failed";
            findRepo.errorMessage = error.message;
            await findRepo.save();
        }
        return res.status(500).json({
            success:false,
            message:"analysis server error",
        })
    }
    }   

export const getAnalysis=async (req,res)=>{
   try {
     const {repoId}=req.params;
    const analysisRepo=await Analysis.findOne({repoId});
    if(!analysisRepo){
      return res.status(400).json({
        success:false,
        message:"repo is not find",
      })
    }
    return res.status(200).json({
        success:true,
        message:"analysis repo present here",
        analysis:analysisRepo,
    })
   } catch (error) {
    return res.status(500).json({
        success: false,
        message: "get analysis Server error",
    })
   }
}

export const getStatus=async(req, res)=>{
  try {
    const {repoId}=req.params;
  const statusRepo=await Analysis.findOne({repoId});
    if(!statusRepo){
      return res.status(400).json({
        success:false,
        message:"repo is not find",
      })
    }
    return res.status(200).json({
        success:true,
        message:"status get successfully",
        status:statusRepo.status,
    })
  } catch (error) {
    return res.status(500).json({
        success:false,
        message:"status server error",
    })
  }
}

export const reAnalyze =async(req,res)=>{
try {
    const {repoId}=req.params;

const findRepo=await Repo.findById(repoId);
if(!findRepo){
    return res.status(400).json({
        success:false,
        message:"repo not found",
    })
}
await Analysis.findOneAndDelete({repoId});

findRepo.status="pending";
await findRepo.save();

return startAnalysis(req, res)
} catch (error) {
    return res.status(500).json({
        success:false,
        message:"reAnalyse server error",
    })
}
}