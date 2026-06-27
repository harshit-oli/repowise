import { useNavigate, useParams } from "react-router-dom";
import { setSelectedFile } from "../redux/fileSlice";
import { useEffect } from "react";
import axios from "axios";
import { serverUrl } from "../App";
import { useDispatch, useSelector } from "react-redux";

const FilePage = () => {
  const navigate = useNavigate();
  const { repoId, fileId } = useParams();
  const dispatch=useDispatch();
  const {selectedFile}=useSelector(state=>state.file);
  const file = {
    fileName: "authController.js",
    filePath: "backend/controllers/authController.js",
    size: 4200,
    summary: "This file handles all authentication related operations including user registration, login, logout, OTP verification, and GitHub OAuth integration. It uses JWT tokens for session management and bcrypt for password hashing.",
    content: `import User from "../models/auth.model.js";\nimport bcrypt from "bcryptjs";\n\nexport const register = async (req, res) => {\n  // registration logic\n}`,
  };
   
  useEffect(()=>{
      const getFileId=async()=>{
       try {
         const result=await axios.get(`${serverUrl}/api/file/getFileById/${fileId}`,{withCredentials:true});
         console.log(result.data.singleFile);
         dispatch(setSelectedFile(result.data.singleFile));
       } catch (error) {
         console.log(error);
       }
      }
      getFileId();
    },[fileId])

  return (
    <div className="min-h-screen bg-gray-800 text-slate-200">
      <div className="bg-gray-900 border-b border-gray-700 px-4 md:px-8 py-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => navigate(`/repos/${repoId}`)}
            className="text-slate-400 hover:text-white text-base flex items-center gap-1 transition-colors cursor-pointer"
          >
            ← Back
          </button>
          <span className="text-slate-600">/</span>
          <span className="text-slate-400 text-sm hover:text-white cursor-pointer" onClick={() => navigate(`/repos/${repoId}`)}>
            File Summaries
          </span>
          <span className="text-slate-600">/</span>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-gray-700 border border-gray-600 flex items-center justify-center text-sm">
              ☰
            </div>
            <span className="text-sm font-semibold text-slate-100">{selectedFile?.fileName}</span>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 py-6 flex flex-col gap-5">

        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-xl font-bold text-slate-100">{selectedFile?.fileName}</div>
              <div className="text-sm text-slate-500 mt-1">{selectedFile?.filePath}</div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-800">
            <div className="text-xs text-slate-500 uppercase tracking-widest mb-2">Summary</div>
            <div className="text-base text-slate-300 leading-relaxed">{selectedFile?.summary || "No Summary yet Please click on Generate summary button to refresh the summary"}</div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-5">
          <div className="text-xs text-slate-500 uppercase tracking-widest mb-3">File Content</div>
          <pre className="text-sm text-slate-300 bg-gray-800 rounded-xl p-4 overflow-x-auto whitespace-pre-wrap leading-relaxed">
            {selectedFile?.content}
          </pre>
        </div>

      </div>
    </div>
  );
};

export default FilePage;