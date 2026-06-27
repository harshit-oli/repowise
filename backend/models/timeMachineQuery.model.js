import mongoose from "mongoose";

const timeMachineSchema = new mongoose.Schema({
    repoId:{
       type: mongoose.Schema.Types.ObjectId,
       ref: "Repo" 
    },
    userId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    question:{
      type: String
    },
    answer:{
      type: String
    },
}, { timestamps: true });

const TimeMachine = mongoose.model("TimeMachine", timeMachineSchema);
export default TimeMachine;