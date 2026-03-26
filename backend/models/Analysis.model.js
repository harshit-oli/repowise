import mongoose from "mongoose";

const analysisSchema=new mongoose.Schema({
    repoId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Repo",
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
    summary:{
        type:String,
    },
    architecture:{
        type:String,
    },
    folderStructure:{
        type:String,
    },
    apiFlow:{
        type:String,
    },
    diagrams:{
       sequenceDiagram: String,
       flowChart: String
    },
    fileSummaries:[
        {
            fileName:String,
            filePath:String,
            summary:String,
        }
    ],
    techStack:[String],
    complexity:{
        type:String,
        enum:["low","medium","high"]
    },
   token:{
    type:Number,
   },
   status:{
    type:String,
    enum:["processing","completed","failed"],
    default:"processing",
   },
   errorMessage:{
    type:String,
   }
},{timestamps:true});

const Analysis=mongoose.model("Analysis",analysisSchema);
export default Analysis;