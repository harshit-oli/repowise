import mongoose from "mongoose";

const teamSchema = new mongoose.Schema({
    teamName: { 
        type: String, 
        required: true 
    },
    ownerId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
    },
    members: [
        {
            userId: { 
                type: mongoose.Schema.Types.ObjectId, 
                ref: "User" 
            },
            role: { 
                type: String, 
                enum: ["admin", "member", "viewer"],
                default: "member"
            },
        },
    ],
    repos: [
        { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Repo" 
        }
    ],
    inviteCode: { 
        type: String,
        unique: true,
    },
}, { timestamps: true });

const Team = mongoose.model("Team", teamSchema);
export default Team;