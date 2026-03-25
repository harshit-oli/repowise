import mongoose from "mongoose"

const repoSchema=new mongoose.Schema({
    userId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    },
    repoName:{
        type:String,
        required:true,
    },
    repoUrl:{
        type:String,
        required:true,
    },
    defaultBranch:{
        type:String,
        default:"main",
    },
    visibility:{
        type:String,
        enum:["public","private"],
    },
    language:{
        type:String,
    },
    stars:{
        type:Number,
    },
    forks:{
        type:Number,
    },
    size:{
        type:Number,
    },
    status:{
        type:String,
        enum:["pending","processing","completed","failed"],
        default:"pending",
    },
    lastAnalyzed:{
        type:Date,
    },
    analysisVersion:{
        type:Number,
        default:1,
    },
    errorMessage:{
        type:String,
    },
},{timestamps:true});

const Repo=mongoose.model("Repo",repoSchema);
export default Repo;