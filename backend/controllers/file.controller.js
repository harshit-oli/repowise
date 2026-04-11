import { Octokit } from "@octokit/rest";
import File from "../models/file.model.js";
import Repo from "../models/repo.model.js"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { Pinecone } from "@pinecone-database/pinecone";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { PineconeStore } from "@langchain/pinecone";



class GeminiEmbeddings {
    constructor(apiKey) {
        const genAI = new GoogleGenerativeAI(apiKey);
        this.model = genAI.getGenerativeModel({ model: "models/gemini-embedding-001" });
    }

    async embedQuery(text, retries = 5) {
        for (let i = 0; i < retries; i++) {
            try {
                const result = await this.model.embedContent(text);
                return result.embedding.values.slice(0, 768);
            } catch (err) {
                if ((err.status === 503 || err.status === 429) && i < retries - 1) {
                    const wait = (i + 1) * 10000;
                    console.warn(`Retrying in ${wait / 1000}s...`);
                    await new Promise(r => setTimeout(r, wait));
                } else {
                    throw err;
                }
            }
        }
    }

    async embedDocuments(texts) {
        const BATCH_SIZE = 10;
        const DELAY = 7000;
        const results = [];

        for (let i = 0; i < texts.length; i += BATCH_SIZE) {
            const batch = texts.slice(i, i + BATCH_SIZE);
            console.log(`Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(texts.length / BATCH_SIZE)}`);

            const batchResults = await Promise.all(
                batch.map(text => this.embedQuery(text))
            );
            results.push(...batchResults);

            if (i + BATCH_SIZE < texts.length) {
                console.log("Waiting 7s...");
                await new Promise(r => setTimeout(r, DELAY));
            }
        }
        return results;
    }
}


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
                     if(["node_modules", ".git", "dist", "build","package-lock.json"].includes(item.name)){
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
             console.log("Total files to process:", fileContents.length)
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    for(const file of fileContents){ 
    const existingFile = await File.findOne({ repoId, filePath: file.filePath });
    console.log(file.fileName, existingFile ? "SKIP" : "PROCESS")
    if(existingFile) continue;
    const prompt = `
    You are a code analyzer.
    Analyze this file and return a 2-3 sentence summary of what it does.
    
    File Name: ${file.fileName}
    File Content: ${file.content}
    
    Return only the summary, no extra text.
    `;
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
    await new Promise(r => setTimeout(r, 15000));
  }

  return res.status(200).json({
  success: true,
      message: "File summaries generated successfully",
      totalProcessed: fileContents.length
  });    
  } catch (error) {
    return res.status(500).json({
        success:false,
        message:"file server error",
        error
    })
  }
   
}

export const getFileSummaries=async(req,res)=>{
    try {
    const {repoId}=req.params;
    const files=await File.find({repoId});
    if(files.length==0){
        return res.status(400).json({
            success:false,
            message:"repo not found",
        })
    }
    return res.status(200).json({
        success:true,
        message:"FileSummaries found",
        files,
    })
    } catch (error) {
      return res.status(500).json({
        success:false,
        message:"FileSummaries server error",
      })  
    }
}

export const getFileById=async(req,res)=>{
 try {
     const {fileId}=req.params;
    const singleFile=await File.findById(fileId);
    if(!singleFile){
        return res.status(400).json({
            success:false,
            message:"repo not found",
        })
    }

    if(singleFile.userId.toString() !== req.userId){
       return res.status(403).json({
           success: false,
           message: "Unauthorized"
       })
    }
        return res.status(200).json({
        success:true,
        message:"singleFilesummaries found",
        singleFile,
    })

 } catch (error) {
    return res.status(500).json({
        success:false,
        message:"singleFile server error",
    })
 }
} 

export const searchFiles=async(req,res)=>{
    try {
        const {query}=req.body;
        const {repoId}=req.params;
        
        if(!query){
            return res.status(403).json({
                success:false,
                message:"query not found",
            })
        }
        const files=await File.find({
            repoId,
            $or:[
               { fileName: { $regex: query, $options: "i" } },
               { summary: { $regex: query, $options: "i" } }
            ]
        })
       if(files.length === 0){
       return res.status(404).json({
         success: false,
         message: "No files found"
        })
       }
       return res.status(200).json({
        success: true,
        files
      })

    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"searchFile server error",
        })
    }
}

export const generateEmbeddings = async (req, res) => {
    try {
        const { repoId } = req.params;

        const repo = await Repo.findById(repoId);
        if (!repo) {
            return res.status(404).json({
                success: false,
                message: "Repo not found",
            });
        }

        if (repo.userId.toString() !== req.userId) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const files = await File.find({ repoId });
        if (files.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No files found",
            });
        }

        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
        });

        const allDocs = [];
        for (const file of files) {
            const docs = await textSplitter.createDocuments(
                [file.content],
                [{
                    fileId: file._id.toString(),
                    repoId: repoId,
                    fileName: file.fileName,
                    filePath: file.filePath,
                }]
            );
            allDocs.push(...docs);
        }

        const filteredDocs = allDocs.filter(doc => doc.pageContent.trim() !== "");

        const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
        const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);
        const embeddings = new GeminiEmbeddings(process.env.GEMINI_API_KEY);

        await PineconeStore.fromDocuments(filteredDocs, embeddings, {
            pineconeIndex,
            maxConcurrency: 1,
        });

        return res.status(200).json({
            success: true,
            message: "Embeddings generated successfully",
            totalFiles: files.length,
            totalDocs: filteredDocs.length,
        });

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            success: false,
            message: "generateEmbeddings server error",
        });
    }
};