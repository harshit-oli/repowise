import Team from "../models/team.model.js";
import User from "../models/auth.model.js";

export const createTeam = async (req, res) => {
  try {
    const { teamName } = req.body;
    const userId = req.userId;

    if (!teamName) {
      return res.status(400).json({
        success: false,
        message: "teamName not found",
      });
    }

    const inviteCode = Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase();
    const team = await Team.create({
      teamName,
      ownerId: userId,
      members: [{ userId, role: "admin" }],
      inviteCode,
    });
    await User.findByIdAndUpdate(userId, { teamId: team._id });
    return res.status(200).json({
      success: true,
      message: "team created successfully",
      team,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "createTeam server error",
    });
  }
};

export const joinTeam = async (req, res) => {
  try {
    const { inviteCode } = req.body;
    const userId = req.userId;
    if (!inviteCode) {
      return res.status(400).json({
        success: false,
        message: "inviteCode not found",
      });
    }
    const team = await Team.findOne({ inviteCode });
    if (!team) {
      return res.status(404).json({
        success: false,
        message: "no team found",
      });
    }
    const alreadyMember = team.members.some(
      (m) => m.userId.toString() === userId,
    );
    if (alreadyMember) {
      return res.status(400).json({
        success: false,
        message: "already a member of this team",
      });
    }
    team.members.push({ userId, role: "member" });
    await team.save();
    await User.findByIdAndUpdate(userId, { teamId: team._id });

    return res.status(200).json({
      success: true,
      message: "welcome to our team",
      team,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "joinTeam error",
    });
  }
};

export const getTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const team = await Team.findById(teamId)
      .populate("members.userId", "name email")
      .populate("ownerId", "name email");
    if (!team) {
      return res.status(400).json({
        success: false,
        message: "team not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "team found successfully",
      team,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "getTeam server error",
    });
  }
};

export const addMember = async (req, res) => {
  try {
    const userId = req.userId;
    const { teamId } = req.params;
    const { memberEmail, role } = req.body;

    const team = await Team.findById(teamId);
    if (!teamId) {
      return res.status(404).json({
        success: false,
        message: "team not found",
      });
    }
    if (team.ownerId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized owner h",
      });
    }

    const member = await User.findOne({ email: memberEmail });
    if (!member) {
      return res.status(400).json({
        success: false,
        message: "user not found",
      });
    }
    const alreadyMember = team.members.some(
      (m) => m.userId.toString() == member._id.toString(),
    );
    if (alreadyMember) {
      return res.status(400).json({
        success: false,
        message: "member already present",
      });
    }
    team.members.push({ userId: member._id, role: role || "member" });
    await team.save();
    const updatedTeam = await Team.findById(teamId)
      .populate("members.userId", "name email")
      .populate("ownerId", "name email");
    return res.status(200).json({
      success: true,
      message: "member added successfully",
      team: updatedTeam,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "addMember server error" });
  }
};

export const removeMember = async (req, res) => {
  try {
    const { teamId, memberId } = req.params;
    const userId = req.userId;

    const team = await Team.findById(teamId);
    if (!team) {
      return res
        .status(404)
        .json({ success: false, message: "team not found" });
    }

    if (team.ownerId.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }
    team.members = team.members.filter((m) => m.userId.toString() !== memberId);
    await team.save();
    const updatedTeam = await Team.findById(teamId)
      .populate("members.userId", "name email")
      .populate("ownerId", "name email");

    return res.status(200).json({
      success: true,
      message: "member removed successfully",
      team: updatedTeam,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "removeMember server error",
    });
  }
};

export const getTeamRepos = async (req, res) => {
  try {
    const { teamId } = req.params;
    const team = await Team.findById(teamId).populate("repos");
    if (!team) {
      return res.status(404).json({
        success: false,
        message: "team not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "team repos found",
      repos: team.repos,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "getTeamRepos server error",
    });
  }
};

export const deleteTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.userId;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: "team not found",
      });
    }
    if (team.ownerId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }
    await User.updateMany({ teamId: team._id }, { $set: { teamId: null } });

    await Team.findByIdAndDelete(teamId);

    return res.status(200).json({
      success: true,
      message: "team deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "deleteTeam server error",
    });
  }
};
