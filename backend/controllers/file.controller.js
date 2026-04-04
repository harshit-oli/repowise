import { Octokit } from "@octokit/rest";
import File from "../models/file.model.js";
import Repo from "../models/repo.model.js"
import { GoogleGenerativeAI } from "@google/generative-ai"

export const generateFileSummaries=async(req,res)=>{
  try {
     const {repoId}=req.params;
            let findRepo=await Repo.findById(repoId)
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

    for(const file of fileContents){ 
    const existingFile = await File.findOne({ repoId, filePath: file.filePath });
    if(existingFile) continue;
    const prompt = `
    You are a code analyzer.
    Analyze this file and return a 2-3 sentence summary of what it does.
    
    File Name: ${file.fileName}
    File Content: ${file.content}
    
    Return only the summary, no extra text.
    `;
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const summary = result.response.text();

    await File.create({
        repoId,
        userId: req.userId,
        fileName: file.fileName,
        filePath: file.filePath,
        content: file.content,
        summary,
        size: file.content.length,
    });
  }

  return res.status(200).json({
  success: true,
      message: "File summaries generated successfully",
  });    
  } catch (error) {
    return res.status(500).json({
        success:false,
        message:"file server error",
    })
  }
   
}
