import mongoose from "mongoose"

const fileSchema= new mongoose.Schema({
    repoId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Repo",
    },
    userId:{
         type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
    fileName:{
        type:String,
    },
    filePath:{
        type:String,
    },
    language:{
        type:String,
    },
    size:{
      type:Number,
    },
    content:{
        type:String,
    },
    summary:{
        type:String,
    },
    embedding: {
    type: [Number],
    default: []
    },
    lastUpdated:{
        type:Date,
    }
},{timestamps:true});

const File=mongoose.model("File",fileSchema);
export default File;
