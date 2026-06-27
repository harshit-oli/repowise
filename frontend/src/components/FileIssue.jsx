import axios from "axios";
import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { serverUrl } from "../App";
import { setIssuesData } from "../redux/securitySlice";
import { useDispatch, useSelector } from "react-redux";

const FileIssue = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { issuesData } = useSelector((state) => state.security);

  const { repoId, fileName } = useParams();

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const result = await axios.get(
          `${serverUrl}/api/security/issueFile/${repoId}/${fileName}`,
          { withCredentials: true }
        );

        dispatch(setIssuesData(result.data.fileIssues || []));
      } catch (error) {
        console.log(error);
        dispatch(setIssuesData([]));
      }
    };

    if (repoId && fileName) {
      fetchIssues();
    }
  }, [repoId, fileName, dispatch]);

  const getSeverityClass = (severity) => {
    switch (severity?.toLowerCase()) {
      case "critical":
        return "bg-red-950 text-red-400 border-red-900";
      case "high":
        return "bg-orange-950 text-orange-400 border-orange-900";
      case "medium":
        return "bg-yellow-950 text-yellow-400 border-yellow-900";
      default:
        return "bg-green-950 text-green-400 border-green-900";
    }
  };

  return (
    <div className="min-h-screen bg-gray-800 text-slate-200">

      {/* HEADER */}
      <div className="bg-gray-900 border-b border-gray-700 px-4 md:px-8 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg text-sm"
          >
            ← Back
          </button>

          <div>
            <h1 className="text-xl md:text-2xl font-bold">
              Security Issues
            </h1>
            <p className="text-slate-400 text-sm">
              File: {fileName}
            </p>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-6xl mx-auto p-4 md:p-6">

        {/* EMPTY STATE */}
        {Array.isArray(issuesData) && issuesData.length === 0 && (
          <div className="text-center text-slate-400 mt-10">
            No issues found for this file
          </div>
        )}

        {/* ISSUES LIST */}
        {Array.isArray(issuesData) &&
          issuesData.map((issue, index) => (
            <div
              key={index}
              className="bg-gray-900 border border-gray-700 rounded-2xl p-4 md:p-6 mb-5"
            >

              {/* TOP */}
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">

                {/* LEFT */}
                <div>
                  <h2 className="text-lg font-bold text-slate-100 break-all">
                    {issue?.file}
                  </h2>
                  <p className="text-slate-400 mt-1 text-sm">
                    Line {issue?.line}
                  </p>
                </div>

                {/* RIGHT BADGE */}
                <span
                  className={`inline-flex items-center justify-center px-3 py-1 rounded-full border text-xs md:text-sm font-semibold w-fit ${getSeverityClass(
                    issue?.severity
                  )}`}
                >
                  {issue?.severity}
                </span>
              </div>

              {/* DESCRIPTION */}
              <div className="mt-6">
                <h3 className="font-semibold text-slate-100 mb-2">
                  Description
                </h3>
                <div className="bg-gray-800 rounded-xl p-4 text-slate-300">
                  {issue?.description}
                </div>
              </div>

              {/* SUGGESTION */}
              <div className="mt-5">
                <h3 className="font-semibold text-slate-100 mb-2">
                  Recommendation
                </h3>
                <div className="bg-gray-800 rounded-xl p-4 text-slate-300">
                  {issue?.suggestion}
                </div>
              </div>

              {/* VULNERABLE CODE */}
              <div className="mt-5">
                <h3 className="font-semibold text-red-400 mb-2">
                  Vulnerable Code
                </h3>
                <pre className="bg-black overflow-x-auto rounded-xl p-4 text-sm text-slate-300">
                  <code>{issue?.codeSnippet}</code>
                </pre>
              </div>

              {/* FIXED CODE */}
              <div className="mt-5">
                <h3 className="font-semibold text-green-400 mb-2">
                  Suggested Fix
                </h3>
                <pre className="bg-black overflow-x-auto rounded-xl p-4 text-sm text-slate-300">
                  <code>{issue?.fixedCode}</code>
                </pre>
              </div>

            </div>
          ))}
      </div>
    </div>
  );
};

export default FileIssue;