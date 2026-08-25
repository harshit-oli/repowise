import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { serverUrl } from "../App";

const CommitAnalysisPage = () => {
  const navigate = useNavigate();
  const { repoId, sha } = useParams();
  const { historyData } = useSelector(state => state.commits);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDiff, setShowDiff] = useState(false);

  const commit = historyData?.commits?.find(c => c.sha === sha);

  useEffect(() => {
    const fetchAnalysis = async () => {
      setLoading(true);
      setError("");
      try {
        const result = await axios.get(`${serverUrl}/api/commits/analyzeCommit/${repoId}/${sha}`, { withCredentials: true });
        setAnalysis(result.data.result);
      } catch (err) {
        setError("Could not analyze this commit. Try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, [repoId, sha]);

  const getTime = (date) => {
    if (!date) return "";
    const diff = Date.now() - new Date(date);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return "just now";
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    return `${Math.floor(months / 12)}y ago`;
  };

  return (
    <div className="min-h-screen bg-gray-800 text-slate-200">
      <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur border-b border-gray-700 px-4 sm:px-6 md:px-8 py-3 sm:py-4">
        <button
          onClick={() => navigate(`/repos/${repoId}?tab=Commits`)}
          className="text-slate-400 hover:text-white text-sm flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <span className="text-base">←</span> Back to commits
        </button>
      </div>

      <div className="px-4 sm:px-6 md:px-8 py-5 sm:py-6 max-w-3xl mx-auto flex flex-col gap-4">
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-950 border border-emerald-900 flex items-center justify-center text-base flex-shrink-0">
              ⎇
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm sm:text-base font-semibold text-slate-100 break-words">
                {commit?.message || "Loading commit..."}
              </p>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2 text-xs sm:text-sm text-slate-400">
                <span className="font-medium text-slate-300">{commit?.author}</span>
                <span className="text-slate-600">·</span>
                <span>{getTime(commit?.date)}</span>
                <span className="text-slate-600">·</span>
                <span>{commit?.filesChanged?.length || 0} file{commit?.filesChanged?.length === 1 ? "" : "s"} changed</span>
              </div>
            </div>
          </div>

          {commit?.filesChanged?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-gray-800">
              {commit.filesChanged.map((file, i) => (
                <span key={i} className="text-xs bg-gray-800 border border-gray-700 text-slate-400 px-2 py-1 rounded-lg break-all">
                  {file}
                </span>
              ))}
            </div>
          )}

          <div className="mt-3 pt-3 border-t border-gray-800">
            <span className="text-xs text-slate-500 font-mono break-all">{sha}</span>
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm">✦</span>
            <p className="text-xs text-slate-500 uppercase tracking-widest">AI Analysis</p>
          </div>

          {loading && (
            <div className="flex flex-col gap-2">
              <div className="h-3 bg-gray-800 rounded-full w-full animate-pulse" />
              <div className="h-3 bg-gray-800 rounded-full w-5/6 animate-pulse" />
              <div className="h-3 bg-gray-800 rounded-full w-2/3 animate-pulse" />
            </div>
          )}
          {error && !loading && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          {analysis && !loading && !error && (
            <p className="text-sm sm:text-[15px] text-slate-200 leading-relaxed whitespace-pre-line">
              {analysis}
            </p>
          )}
        </div>
        {commit?.diff && (
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-4 sm:p-5">
            <button
              onClick={() => setShowDiff(!showDiff)}
              className="flex items-center justify-between w-full text-left cursor-pointer"
            >
              <p className="text-xs text-slate-500 uppercase tracking-widest">Raw diff</p>
              <span className="text-slate-500 text-sm">{showDiff ? "▲" : "▼"}</span>
            </button>
            {showDiff && (
              <pre className="text-xs text-slate-300 bg-gray-800 border border-gray-700 rounded-xl p-3 sm:p-4 mt-3 overflow-x-auto whitespace-pre-wrap break-all">
                {commit.diff}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
export default CommitAnalysisPage;
