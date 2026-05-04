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
    dependencies: [
        {
            importedFilePath: String,
            importedFileName: String,
            importType: {
                type: String,
                enum: ["local", "external"],
            }
        }
    ],
    depth: {
        type: Number,
        default: 0,
    },
    }, { timestamps: true })
    
    const Dependency = mongoose.model("Dependency", dependencySchema)
    export default Dependency