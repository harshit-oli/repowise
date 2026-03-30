import mongoose from "mongoose"

const AiRequestSchema=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
    repoId:{
      type:mongoose.Schema.Types.ObjectId,
        ref:"Repo",
    },
    prompt:{
        type:String,
    },
    response:{
        type:String,
    },
    tokenUsed:{
        type:Number,
    },
    cost:{
        type:Number,
    },
    modelUsed:{
        type:String,
    },
    featureType:{
        type:String,
        enum:["summary","chat","file-explain"]
    }
},{timeStamps:true});

const AiRequest=mongoose.model("AiRequest",AiRequestSchema);
export default AiRequest;