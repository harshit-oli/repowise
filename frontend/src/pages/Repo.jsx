import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import GetRepos from '../hooks/GetRepos';
import axios from 'axios';
import { serverUrl } from '../App';

const Repos = () => {
  const { repoData } = useSelector(state => state.repo);
  const navigate = useNavigate();
  const [analyzing, setAnalyzing] = useState(null);

  const getTime = (date) => {
    if (!date) return "Never analyzed";
    const diff = Date.now() - new Date(date);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    const years = Math.floor(months / 12);
    return `${years}y ago`;
  };

  const getStatusClass = (status) => {
    if (status === "completed") return "bg-green-950 text-green-400 border border-green-900";
    if (status === "processing") return "bg-amber-950 text-amber-400 border border-amber-900";
    if (status === "failed") return "bg-red-950 text-red-400 border border-red-900";
    return "bg-slate-800 text-slate-400 border border-slate-700";
  };

  const getLangColor = (lang) => {
    const colors = {
      JavaScript: "bg-yellow-500",
      TypeScript: "bg-blue-500",
      Python: "bg-green-500",
      React: "bg-cyan-500",
      "HTML/CSS": "bg-orange-500",
    };
    return colors[lang] || "bg-slate-500";
  };

  const handleAnalyze = async (repoId) => {
    setAnalyzing(repoId);
    try {
      await axios.post(`${serverUrl}/api/analysis/startAnalysis/${repoId}`, {}, { withCredentials: true });
      navigate(`/repos/${repoId}?tab=Analysis`);
    } catch (error) {
      console.log(error);
    } finally {
      setAnalyzing(null);
    }
  };

  return (
    <>
      <GetRepos />
      <div className="min-h-screen bg-gray-800 px-4 md:px-8 py-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Your Repos</h1>
            <p className="text-base text-slate-400 mt-1">
              {repoData ? `${repoData.length} repo${repoData.length !== 1 ? "s" : ""} connected` : "Loading..."}
            </p>
          </div>
          <button
            onClick={() => navigate("/addrepo")}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-5 py-2.5 text-base font-semibold cursor-pointer transition-colors"
          >
            + Add repo
          </button>
        </div>

        {!repoData && (
          <div className="flex items-center justify-center py-20">
            <div className="text-blue-400 text-base">Loading...</div>
          </div>
        )}

        {repoData && repoData.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="text-6xl text-white">⎇</div>
            <div className="text-xl font-bold text-slate-100">No repos yet</div>
            <div className="text-base text-slate-400">Add your first GitHub repo to get started</div>
            <button
              onClick={() => navigate("/addrepo")}
              className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-6 py-3 text-base font-semibold cursor-pointer transition-colors mt-2"
            >
              + Add repo
            </button>
          </div>
        )}

        {repoData && repoData.length > 0 && (
          <div className="flex flex-col gap-3">
            {repoData.map((repo) => (
              <div
                key={repo._id}
                className="bg-gray-900 border border-gray-700 hover:border-gray-500 rounded-2xl p-4 md:p-5 flex flex-wrap items-center justify-between gap-4 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-gray-800 border text-white border-gray-700 flex items-center justify-center text-xl flex-shrink-0">
                    ⎇
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-white truncate text-xl">{repo?.repoName}</div>
                    <div className="flex flex-wrap items-center gap-3 mt-1">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2.5 h-2.5 rounded-full ${getLangColor(repo?.language)}`} />
                        <span className="text-md text-slate-400">{repo?.language || "Unknown"}</span>
                      </div>
                      <span className="text-slate-600">·</span>
                      <span className="text-md text-slate-400">⭐ {repo?.stars ?? 0}</span>
                      <span className="text-slate-600">·</span>
                      <span className="text-md text-slate-400">⎇ {repo?.forks ?? 0} forks</span>
                      <span className="text-slate-600">·</span>
                      <span className="text-md text-slate-400">📦 {repo?.size ?? 0} KB</span>
                      <span className="text-slate-600">·</span>
                      <span className="text-md text-slate-400">🕐 {getTime(repo?.lastAnalyzed)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`text-md px-3 py-1 rounded-full font-semibold ${getStatusClass(repo?.status)}`}>
                    {repo?.status}
                  </span>
                  <button
                    onClick={() => repo.status !== "completed" ? handleAnalyze(repo._id) : navigate(`/repos/${repo._id}`)}
                    disabled={analyzing === repo._id}
                    className="bg-gray-500 hover:bg-gray-400 disabled:opacity-50 border border-gray-600 hover:border-gray-400 hover:text-white rounded-xl px-4 py-2 text-md font-semibold text-slate-300 cursor-pointer transition-colors"
                  >
                    {analyzing === repo._id ? "Analyzing..." : repo?.status === "completed" ? "View" : "Analyze"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Repos;