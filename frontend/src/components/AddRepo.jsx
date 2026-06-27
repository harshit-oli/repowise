import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { serverUrl } from '../App';

const AddRepo = () => {
  const navigate = useNavigate();
  const [repoUrl, setRepoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
        await axios.post(`${serverUrl}/api/repo/addRepo`, { repoUrl }, { withCredentials: true });
        navigate("/repos");
    } catch (error) {
        if(error.response?.status === 403) {
            window.location.href = `${serverUrl}/api/auth/github/connect`;
        } else {
          console.log(error);
            setError(error.response?.data?.message || "Something went wrong");
        }
    } finally {
        setLoading(false);
    }
};

  return (
    <div className="min-h-screen bg-gray-800 flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <button
          onClick={() => navigate("/repos")}
          className="text-slate-400 hover:text-white text-base flex items-center gap-2 mb-6 transition-colors cursor-pointer font-bold size-2xl"
        >
          ←
        </button>
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8">
          <div className="mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gray-800 text-white border border-gray-700 flex items-center justify-center text-3xl mb-4">
              ⎇
            </div>
            <h1 className="text-2xl font-bold text-white">Add a repo</h1>
            <p className="text-base text-slate-400 mt-2">
              Paste your GitHub repo URL to get started
            </p>
          </div>
          <div className="mb-4">
            <label className="text-base font-semibold text-slate-300 mb-2 block">
              GitHub Repo URL
            </label>
            <input
              type="text"
              value={repoUrl}
              onChange={(e) => { setRepoUrl(e.target.value); setError(""); }}
              placeholder="https://github.com/username/repo-name"
              className="w-full bg-gray-800 border border-gray-700 focus:border-blue-500 rounded-xl px-4 py-3.5 text-base text-slate-200 outline-none placeholder-slate-500 transition-colors"
            />
          </div>
          {error && (
            <div className="bg-red-950 border border-red-900 rounded-xl px-4 py-3 text-sm text-red-400 mb-4">
              ⚠ {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => navigate("/repos")}
              className="flex-1 bg-transparent border border-gray-600 hover:border-gray-400 rounded-xl py-3 text-base font-semibold text-slate-400 hover:text-white cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-xl py-3 text-base font-semibold text-white cursor-pointer transition-colors"
            >
              {loading ? "Adding..." : "Add repo"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AddRepo;