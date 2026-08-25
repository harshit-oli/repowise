import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { serverUrl } from "../App";
import { setTeamData } from "../redux/teamSlice";
import { useNavigate } from "react-router-dom";

const TeamPage = () => {
  const dispatch = useDispatch();
  const { userData } = useSelector(state => state.user);
  const { teamData } = useSelector(state => state.team);
  const navigate=useNavigate();

  const [mode, setMode] = useState("create"); // create | join
  const [teamName, setTeamName] = useState("");
  const [inviteCodeInput, setInviteCodeInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const [memberEmail, setMemberEmail] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const fetchTeam = async () => {
      if (!userData?.teamId) return;
      try {
        const result = await axios.get(`${serverUrl}/api/team/getTeam/${userData.teamId}`, { withCredentials: true });
        dispatch(setTeamData(result.data.team));
      } catch (err) {
        console.log(err);
      }
    };
    fetchTeam();
  }, [userData]);

  const isOwner = teamData?.ownerId?._id === userData?._id;

  const handleCreateTeam = async () => {
    if (!teamName.trim()) return;
    setLoading(true);
    setError("");
    try {
      const result = await axios.post(`${serverUrl}/api/team/createTeam`, { teamName }, { withCredentials: true });
      dispatch(setTeamData(result.data.team));
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeam = async () => {
    try {
        await axios.delete(`${serverUrl}/api/team/deleteTeam/${teamData._id}`, { withCredentials: true });
        dispatch(setTeamData(null));
    } catch (err) {
        console.log(err);
    }
   };

  const handleJoinTeam = async () => {
    if (!inviteCodeInput.trim()) return;
    setLoading(true);
    setError("");
    try {
      const result = await axios.post(`${serverUrl}/api/team/joinTeam`, { inviteCode: inviteCodeInput }, { withCredentials: true });
      dispatch(setTeamData(result.data.team));
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(teamData.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddMember = async () => {
    if (!memberEmail.trim()) return;
    setAdding(true);
    setError("");
    try {
      const result = await axios.post(`${serverUrl}/api/team/addMember/${teamData._id}`, { memberEmail }, { withCredentials: true });
      dispatch(setTeamData(result.data.team));
      setMemberEmail("");
    } catch (err) {
      setError(err.response?.data?.message || "Could not add member");
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      const result = await axios.delete(`${serverUrl}/api/team/removeMember/${teamData._id}/${memberId}`, { withCredentials: true });
      dispatch(setTeamData(result.data.team));
    } catch (err) {
      console.log(err);
    }
  };
  if (!teamData) {
    return (
      <div className="min-h-screen min-w-screen bg-gray-800 px-4 sm:px-6 py-8 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 sm:p-7">
            <button className="text-white pb-2 cursor-pointer" onClick={()=>navigate("/dashboard")}>✕</button>
            <p className="text-xl font-bold text-slate-100 mb-1">Teams</p>
            <p className="text-sm text-slate-400 mb-6">Collaborate with others on shared repos</p>
            <div className="flex bg-gray-800 rounded-xl p-1 mb-5">
              <button
                onClick={() => { setMode("create"); setError(""); }}
                className={`flex-1 text-sm font-semibold py-2 rounded-lg cursor-pointer transition-colors
                  ${mode === "create" ? "bg-blue-600 text-white" : "text-slate-400"}`}
              >
                Create team
              </button>
              <button
                onClick={() => { setMode("join"); setError(""); }}
                className={`flex-1 text-sm font-semibold py-2 rounded-lg cursor-pointer transition-colors
                  ${mode === "join" ? "bg-blue-600 text-white" : "text-slate-400"}`}
              >
                Join team
              </button>
            </div>

            {mode === "create" ? (
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Team name"
                  className="bg-gray-800 border border-gray-700 focus:border-blue-500 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none placeholder-slate-500 transition-colors"
                />
                <button
                  onClick={handleCreateTeam}
                  disabled={loading || !teamName.trim()}
                  className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-xl py-3 text-sm font-semibold text-white cursor-pointer transition-colors"
                >
                  {loading ? "Creating..." : "Create team"}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  value={inviteCodeInput}
                  onChange={(e) => setInviteCodeInput(e.target.value.toUpperCase())}
                  placeholder="Enter invite code"
                  className="bg-gray-800 border border-gray-700 focus:border-blue-500 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none placeholder-slate-500 transition-colors tracking-widest"
                />
                <button
                  onClick={handleJoinTeam}
                  disabled={loading || !inviteCodeInput.trim()}
                  className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-xl py-3 text-sm font-semibold text-white cursor-pointer transition-colors"
                >
                  {loading ? "Joining..." : "Join team"}
                </button>
              </div>
            )}

            {error && (
              <p className="text-sm text-red-400 mt-3">{error}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-800 px-4 sm:px-6 md:px-8 py-6 flex flex-col gap-4 mx-auto">
             <button className="text-white bg-gray-400 w-[60px] p-2 mb-2 cursor-pointer" onClick={()=>navigate("/dashboard")}>Back</button>
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-xl font-bold text-slate-100">{teamData.teamName}</p>
          <p className="text-md text-slate-400 mt-0.5">{teamData.members?.length} member{teamData.members?.length === 1 ? "" : "s"}</p>
        </div>
        <button
          onClick={handleCopyInvite}
          className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl px-4 py-2 text-sm text-slate-300 cursor-pointer transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <span className="font-mono tracking-wider">{teamData.inviteCode}</span>
          <span className="text-sm text-slate-400 hover:text-white">{copied ? "Copied" : "Copy"}</span>
        </button>

        {isOwner && (
            <button
                onClick={handleDeleteTeam}
                className="bg-red-950 hover:bg-red-900 border border-red-900 rounded-xl px-4 py-2 text-sm text-red-400 cursor-pointer transition-colors"
            >
                Delete team
            </button>
        )}
      </div>

      {isOwner && (
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-5">
          <p className="text-sm font-semibold text-slate-300 mb-3">Add member</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              value={memberEmail}
              onChange={(e) => setMemberEmail(e.target.value)}
              placeholder="member@email.com"
              className="flex-1 bg-gray-800 border border-gray-700 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none placeholder-slate-500 transition-colors min-w-0"
            />
            <button
              onClick={handleAddMember}
              disabled={adding || !memberEmail.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-xl px-5 py-2.5 text-sm font-semibold text-white cursor-pointer transition-colors flex-shrink-0"
            >
              {adding ? "Adding..." : "Add"}
            </button>
          </div>
          {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
        </div>
      )}
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-5">
        <p className="text-md font-semibold text-slate-300 mb-3">Members</p>
        <div className="flex flex-col gap-1">
          {teamData?.members?.map((m) => (
            <div key={m?._id} className="flex items-center justify-between gap-3 py-2.5 border-b border-gray-800 last:border-b-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-xs font-semibold text-slate-300 flex-shrink-0">
                  {m.userId?.name?.slice(0, 1)?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-md text-slate-200 truncate">{m.userId?.name}</p>
                  <p className="text-sm text-slate-500 truncate">{m.userId?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-sm px-2 py-1 rounded-full font-medium
                  ${m.role === "admin" ? "bg-blue-950 text-blue-400 border border-blue-900" :
                    m.role === "viewer" ? "bg-slate-800 text-slate-400 border border-slate-700" :
                    "bg-emerald-950 text-emerald-400 border border-emerald-900"}`}
                >
                  {m.role}
                </span>
                {isOwner && m?.userId?._id !== userData?._id && (
                  <button
                    onClick={() => handleRemoveMember(m.userId._id)}
                    className="text-slate-500 hover:text-red-400 text-md cursor-pointer transition-colors"
                  >✕</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default TeamPage;
