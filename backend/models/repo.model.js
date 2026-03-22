import mongoose from "mongoose"

const repoSchema=new mongoose.Schema({
    user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    },
    name:{
        type:String,
        required:true,
    },
    repoUrl:{
        type:String,
        required:true,
    },
    branch:{
        type:String,
        default:"main",
    },
    defaultBranch:{
        type:String,
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