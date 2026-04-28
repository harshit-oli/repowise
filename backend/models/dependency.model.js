import mongoose from "mongoose"

const dependencySchema=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        },
    repoId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Repo",
    },
    fileId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"File"
    },

})