import { Octokit } from "@octokit/rest";
import Repo from "../models/repo.model";
import { GoogleGenerativeAI } from "@google/generative-ai"
import Analysis from "../models/Analysis.model";

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

   const octokit = new Octokit();
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

Return in this exact format:
{
    "summary": "what this project does",
    "architecture": "system design and structure",
    "folderStructure": "explanation of each folder",
    "apiFlow": "request to response flow",
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
    token: result.usageMetadata.totalTokenCount,
});
    findRepo.status = "completed";
    findRepo.lastAnalyzed = Date.now();
    await findRepo.save();
   return res.status(200).json({
       success: true,
       message: "Analysis complete!",
       analysis,
   });

   } catch (error) {
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