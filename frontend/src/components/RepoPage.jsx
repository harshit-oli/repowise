import axios from "axios";
import { useEffect } from "react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { serverUrl } from "../App";
import { setselectedRepo } from "../redux/repoSlice";
import GetScanResult from "../hooks/GetScanResult";
import { setAnalysisData } from "../redux/analysis";
import GetAnalysis from "../hooks/GetAnalysis";
import GetHistory from "../hooks/GetHistory";
import { setHistoryData } from "../redux/commitSlice";
import { setScanData } from "../redux/securitySlice";
import GetFileSummaries from "../hooks/GetFileSummaries";
import ForceGraph2D from 'react-force-graph-2d';
import { setGraphData, setNodeData } from '../redux/graphSlice';
import { useMemo } from 'react';
import GetGraph from "../hooks/GetGraph";
import ChatTab from "./ChatTab";
import { setSuggestions } from '../redux/refactorSlice';
import GetSuggestions from "../hooks/GetSuggestions";

const RepoPage = () => {
  const navigate = useNavigate();
  const { repoId } = useParams();
  const [activeTab, setActiveTab] = useState("Overview");
  const [reAnalyzing, setReAnalyzing] = useState(false);
  const [find, setFind] = useState(false);
  const dispatch=useDispatch();
  const {selectedRepo}=useSelector((state)=>state.repo);
  const [scanning, setScanning] = useState(false);
  const {scanData}=useSelector(state=>state.security);
  const {analysisData}=useSelector(state=>state.analysis);
  const {historyData}=useSelector(state=>state.commits);
  const [refresh, setRefresh] = useState(false);
  const {filesData} = useSelector(state => state.file)
  const [generating, setGenerating] = useState(false)
  const [embeddingLoading, setEmbeddingLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const { graphData, nodeData } = useSelector(state => state.dependency);
  const [generatingGraph, setGeneratingGraph] = useState(false);
  const [graphRefresh, setGraphRefresh] = useState(false);
  const [tmQuestion, setTmQuestion] = useState("");
  const [tmAsking, setTmAsking] = useState(false);
  const [timeMachineHistory, setTimeMachineHistory] = useState([]);
  const [tmCreditsExhausted, setTmCreditsExhausted] = useState(false);
  const { suggestions } = useSelector(state => state.refactor);
  const [refactorGenerating, setRefactorGenerating] = useState(false); 
  const [refactorFilter, setRefactorFilter] = useState("all");


  const formattedGraph = useMemo(() => {
    if(!graphData) return null;
    const nodes = [];
    const links = [];
    const nodeSet = new Set();
    graphData.forEach(item => {
        const sourceId = item.fileId?.fileName;
        if(sourceId && !nodeSet.has(sourceId)) {
            nodes.push({ id: sourceId, type: "local", fileId: item.fileId?._id });
            nodeSet.add(sourceId);
        }
        item.dependencies.forEach(dep => {
            if(!nodeSet.has(dep.importedFileName)) {
                nodes.push({ id: dep.importedFileName, type: dep.importType });
                nodeSet.add(dep.importedFileName);
            }
            if(sourceId) links.push({ source: sourceId, target: dep.importedFileName });
        });
    });
    return { nodes, links };
}, [graphData]);

 
  useEffect(() => {
        dispatch(setHistoryData(null));
        dispatch(setScanData(null));
        dispatch(setAnalysisData(null));
    }, [repoId]);
  const handleGenerateEmbeddings = async () => {
  setEmbeddingLoading(true);
  try {
    await axios.post(`${serverUrl}/api/file/generateEmbeddings/${repoId}`, {}, {withCredentials: true});
  } catch (error) {
    console.log(error);
  } finally {
    setEmbeddingLoading(false);
  }
  };



const handleGenerateGraph = async () => {
    setGeneratingGraph(true);
    try {
        await axios.post(`${serverUrl}/api/dependency/generateGraph/${repoId}`, {}, {withCredentials: true});
        setGraphRefresh(!graphRefresh);
    } catch (error) {
        console.log(error);
    } finally {
        setGeneratingGraph(false);
    }
};

const handleNodeClick = async (node) => {
   console.log("clicked node:", node);
    if(!node.fileId) return;
    try {
        const result = await axios.get(`${serverUrl}/api/dependency/nodeGraph/${repoId}/${node.fileId}`, {withCredentials: true});
        dispatch(setNodeData(result.data.nodeGraph));
    } catch (error) {
        console.log(error);
    }
};
const handleGenerateSummaries = async () => {
    setGenerating(true);
    try {
        await axios.post(`${serverUrl}/api/file/generateFile/${repoId}`, {}, {withCredentials: true});
        setRefresh(!refresh)
    } catch (error) {
        console.log(error);
    } finally {
        setGenerating(false);
    }
};

 const handleSearch = async () => {
    if(!searchQuery) { setSearchResults(null); return; }
    try {
        const result = await axios.post(`${serverUrl}/api/files/searchFiles/${repoId}`, 
            { query: searchQuery }, 
            { withCredentials: true }
        );
        setSearchResults(result.data.files);
    } catch (error) {
        if(error.response?.status === 404) {
            setSearchResults([]);
        }
        console.log(error);
    }
};

useEffect(() => {
    const timer = setTimeout(() => {
        if(searchQuery) {
            handleSearch();
        } else {
            setSearchResults(null);
        }
    }, 500);

    return () => clearTimeout(timer);
}, [searchQuery]);
  useEffect(()=>{
    const getRepoId=async()=>{
     try {
       const result=await axios.get(`${serverUrl}/api/repo/getRepo/${repoId}`,{withCredentials:true});
       console.log(result.data.repo);
       dispatch(setselectedRepo(result.data.repo));
     } catch (error) {
       console.log(error);
     }
    }
    getRepoId();
  },[repoId])

  const suggestionTypes = [
  ...new Set((suggestions || []).map((s) => s.type))
];

const typeColors = {
  duplicate: "bg-purple-950 text-purple-400 border-purple-900",
  complexity: "bg-red-950 text-red-400 border-red-900",
  naming: "bg-blue-950 text-blue-400 border-blue-900",
  performance: "bg-amber-950 text-amber-400 border-amber-900",
  security: "bg-red-950 text-red-300 border-red-900",
  consistency: "bg-cyan-950 text-cyan-400 border-cyan-900",
  readability: "bg-green-950 text-green-400 border-green-900",
  maintainability: "bg-violet-950 text-violet-400 border-violet-900",
  "best-practice": "bg-indigo-950 text-indigo-400 border-indigo-900",
};

  const handleGenerateSuggestions = async () => {
    setRefactorGenerating(true);
    try {
        const result = await axios.post(`${serverUrl}/api/refactor/generateSuggestions/${repoId}`, {}, {withCredentials: true});
        console.log(result.data.suggestions);
        dispatch(setSuggestions(result.data.suggestions));
    } catch (error) {
       console.log(error.response?.data?.message || error.message);
    } finally {
        setRefactorGenerating(false);
    }
};



  const handleApply = async (suggestionId) => {
    try {
        await axios.patch(`${serverUrl}/api/refactor/applySuggestion/${suggestionId}`, {}, {withCredentials: true});
        dispatch(setSuggestions(suggestions.map(s => s._id === suggestionId ? {...s, status: "applied"} : s)));
    } catch (error) {
        console.log(error);
    }
  };

  const handleIgnore = async (suggestionId) => {
    try {
        await axios.patch(`${serverUrl}/api/refactor/ignoreSuggestion/${suggestionId}`, {}, {withCredentials: true});
        dispatch(setSuggestions(suggestions.map(s => s._id === suggestionId ? {...s, status: "ignored"} : s)));
    } catch (error) {
        console.log(error);
    }
  };



  const handleScan = async () => {
    setScanning(true);
    try {
      const result = await axios.post(`${serverUrl}/api/security/startScan/${repoId}`, {}, {withCredentials:true});
        dispatch(setScanData(result.data.changes));
    } catch (error) {
        console.log(error);
    } finally {
        setScanning(false);
    }
   }

   const handleTimeMachine = async () => {
    if (!tmQuestion.trim() || tmAsking) return;
    setTmAsking(true);
    const q = tmQuestion;
    setTmQuestion("");
    try {
        const result = await axios.post(`${serverUrl}/api/commits/timeMachineQuery/${repoId}`, 
            { question: q }, 
            { withCredentials: true }
        );
        setTimeMachineHistory(prev => [...prev, { question: q, answer: result.data.result }]);
    } catch (error) {
        console.log(error);
        if(error.response?.status === 403) {
             setTmCreditsExhausted(true)
        }
    } finally {
        setTmAsking(false);
    }
    };   

   const handleCommits = async () => {
    setFind(true);
    try {
      const result = await axios.post(`${serverUrl}/api/commits/fetchHistory/${repoId}`, {}, {withCredentials:true});
      console.log("commits ka hai ye----",result.data);
        dispatch(setHistoryData(result?.data?.fetchedHistory));
    } catch (error) {
        console.log(error);
    } finally {
        setFind(false);
    }
   }
   
  const tabs = [
    { name: "Overview", icon: "⊞" },
    { name: "Security", icon: "⛨" },
    { name: "Analysis", icon: "⚙" },
    { name: "File Summaries", icon: "☰" },
    { name: "Commits", icon: "◷" },
    { name: "Dependency Graph", icon: "◎" },
    { name: "Chat", icon: "◻" },
    { name: "Time Machine", icon: "🕰" },
    { name: "Refactor", icon: "⟳" },
  ];

  const getStatusClass = (status) => {
    if (status === "completed") return "bg-green-950 text-green-400 border border-green-900";
    if (status === "processing") return "bg-amber-950 text-amber-400 border border-amber-900";
    if (status === "failed") return "bg-red-950 text-red-400 border border-red-900";
    return "bg-slate-800 text-slate-400 border border-slate-700";
  };

  const handleReAnalyze = async () => {
    setReAnalyzing(true);
    try {
     const result= await axios.post(`${serverUrl}/api/analysis/reAnalyze/${repoId}`, {}, {withCredentials: true});
      console.log("Re-analyzing...", repoId);
      dispatch(setAnalysisData(result.data.analysis));
    } catch (error) {
      console.log(error);
    } finally {
      setReAnalyzing(false);
    }
  };
 const deleteRepo = async () => {
    try {
        await axios.delete(`${serverUrl}/api/repo/delete/${repoId}`, {withCredentials: true});
        navigate("/repos");
    } catch (error) {
        console.log(error);
    }
 };
useEffect(() => {

    const fetchTimeMachineHistory = async () => {
        try {
            const result = await axios.get(`${serverUrl}/api/commits/getTimeMachineHistory/${repoId}`, {withCredentials: true});
            setTimeMachineHistory(result.data.history || []);
        } catch (error) {
            console.log(error);
      }
    }
    fetchTimeMachineHistory();
}, [repoId]);

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
  
  const checkSeverity = (severity) => {
    if(severity === "critical") return "bg-red-950 text-red-400";
    else if(severity === "high") return "bg-amber-950 text-amber-400";
    else if(severity === "medium") return "bg-yellow-600 text-yellow-200";
    else return "bg-green-950 text-green-400";
}
  const critical=scanData?.issues?.filter(i=>i.severity=="critical").length;
  const high=scanData?.issues?.filter(i=>i.severity=="high").length;
  const medium=scanData?.issues?.filter(i=>i.severity=="medium").length;
  const low=scanData?.issues?.filter(i=>i.severity=="low").length;
  return (
    <>
    <GetScanResult repoId={repoId}/>
    <GetAnalysis repoId={repoId}/>
    <GetHistory repoHistoryId={repoId}></GetHistory>
    <GetFileSummaries repoId={repoId} refresh={refresh} />
    <GetGraph repoId={repoId} refresh={graphRefresh} />
    <GetSuggestions repoId={repoId}/>

    <div className="min-h-screen bg-gray-800 text-slate-200">
      <div className="bg-gray-900 border-b border-gray-700 px-4 md:px-8 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-slate-300 hover:text-white bg-gray-700 text-base flex items-center px-2 py-1 rounded-xl gap-1 transition-colors cursor-pointer"
            >
              Back
            </button>
            <span className="text-slate-600 text-lg">/</span>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gray-700 border border-gray-600 flex items-center justify-center text-lg">
                ⎇
              </div>
              <div>
                <div className="text-xl font-bold text-slate-100">{selectedRepo?.repoName}</div>
                <div className="text-md text-slate-400">Last analyzed {getTime(selectedRepo?.lastAnalyzed)}</div>
              </div>
              <span className={`text-md px-3 py-1 rounded-full font-semibold ${getStatusClass(selectedRepo?.status)}`}>
                {selectedRepo?.status}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleReAnalyze}
              disabled={reAnalyzing}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg px-4 py-2 text-sm font-semibold text-white cursor-pointer transition-colors"
            >
              {reAnalyzing ? "Re-analyzing..." : "⟳ Re-analyze"}
            </button>
            <button className="flex items-center gap-2 bg-transparent border border-red-900 hover:bg-red-950 rounded-lg px-4 py-2 text-sm font-semibold text-red-400 cursor-pointer transition-colors" onClick={deleteRepo}>
              Delete
            </button>
            <a
              href={selectedRepo?.repoUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 rounded-lg px-4 py-2 text-sm font-semibold text-slate-200 transition-colors"
            >
              GitHub ↗
            </a>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 mt-3 text-md text-slate-400">
          <span>🌐 {selectedRepo?.language}</span>
          <span>⭐ {selectedRepo?.stars} stars</span>
          <span>⎇ {selectedRepo?.forks} forks</span>
          <span>📦 {selectedRepo?.size} KB</span>
          <span>🌿 {selectedRepo?.defaultBranch}</span>
        </div>
      </div>
      <div className="bg-gray-900 border-b border-gray-700 px-4 md:px-8 overflow-x-auto">
        <div className="flex gap-0 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`flex items-center gap-2 px-4 py-3.5 text-sm font-semibold transition-colors cursor-pointer border-b-2 whitespace-nowrap
                ${activeTab === tab.name
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-600"
                }`}
            >
              <span>{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </div>
      </div>
      <div className="px-4 md:px-8 py-6">

        {activeTab === "Overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
              <div className="text-lg font-bold text-slate-100 mb-4">Repo details</div>
              {[
                { label: "Repo name", value: selectedRepo?.repoName },
                { label: "Language", value: selectedRepo?.language },
                { label: "Stars", value: `⭐ ${selectedRepo?.stars}` },
                { label: "Forks", value: `⎇ ${selectedRepo?.forks}` },
                { label: "Size", value: `${selectedRepo?.size} KB` },
                { label: "Branch", value: `🌿 ${selectedRepo?.defaultBranch}` },
                { label: "Status", value: selectedRepo?.status },
              ].map((item, i) => (
                <div key={i} className={`flex justify-between items-center py-3 ${i < 6 ? "border-b border-gray-800" : ""}`}>
                  <span className="text-base text-slate-400">{item.label}</span>
                  <span className="text-base text-slate-100 font-semibold">{item.value}</span>
                </div>
              ))}
            </div>
            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
              <div className="text-lg font-bold text-slate-100 mb-4">Quick actions</div>
              <div className="flex flex-col gap-3">
                {[
                  { label: "Run security scan", icon: "⛨", color: "text-red-400", tab: "Security" },
                  { label: "View analysis", icon: "⚙", color: "text-blue-400", tab: "Analysis" },
                  { label: "Chat with repo", icon: "◻", color: "text-green-400", tab: "Chat" },
                  { label: "Generate dependency graph", icon: "◎", color: "text-purple-400", tab: "Dependency Graph" },
                  { label: "Open time machine", icon: "🕰", color: "text-amber-400", tab: "Time Machine" },
                  { label: "Refactor suggestions", icon: "⟳", color: "text-cyan-400", tab: "Refactor" },
                ].map((action, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveTab(action.tab)}
                    className="flex items-center gap-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-500 rounded-xl px-5 py-3 text-base text-slate-300 cursor-pointer transition-all text-left"
                  >
                    <span className={`text-xl ${action.color}`}>{action.icon}</span>
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "Security" && (
          <div className="flex flex-col gap-5">

            {!scanData ? (
            <div className="flex flex-col items-center justify-center min-h-[300px] gap-4 bg-gray-900 border border-gray-700 rounded-2xl p-8">
                <div className="text-5xl">⛨</div>
                <div className="text-xl font-bold text-slate-100">No scan yet</div>
                <div className="text-base text-slate-400">Run a security scan to find vulnerabilities</div>
                <button
                    onClick={handleScan}
                    disabled={scanning}
                    className="bg-red-600 hover:bg-red-500 disabled:opacity-50 rounded-xl px-6 py-3 text-base font-semibold text-white cursor-pointer transition-colors"
                >
                    {scanning ? "Scanning..." : "⛨ Run Security Scan"}
                </button>
            </div>
        ) : (  
       <>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 flex items-center gap-5">
                <div className="text-5xl font-bold text-green-400">{scanData?.score}</div>
                <div>
                  <div className="text-base font-bold text-slate-100">Security score</div>
                  <div className="text-sm text-slate-400 mt-1">Latest scan</div>
                </div>
              </div>
              <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
                <div className="text-sm text-slate-400 mb-2">Overall severity</div>
                <div className="text-2xl font-bold text-red-400">{scanData?.severity}</div>
              </div>
              <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
                <div className="text-sm text-slate-400 mb-2">Total issues</div>
                <div className="text-2xl font-bold text-slate-100">{scanData?.issues?.length}</div>
                <div className="flex gap-2 mt-3 flex-wrap">
                  <span className="text-sm px-2 py-1 rounded-full bg-red-950 text-red-400 border border-red-900">{critical} critical</span>
                  <span className="text-sm px-2 py-1 rounded-full bg-amber-950 text-amber-400 border border-amber-900">{high} high</span>
                  <span className="text-sm px-2 py-1 rounded-full bg-yellow-950 text-yellow-400 border border-yellow-900">{medium} medium</span>
                  <span className="text-sm px-2 py-1 rounded-full bg-green-950 text-green-400 border border-green-900">{low} low</span>
                </div>
              </div>
            </div>
            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
              <div className="text-lg font-bold text-slate-100 mb-4">All issues</div>
              {scanData?.issues?.map((data, i) => (
                <div onClick={()=>navigate(`/issueFile/${repoId}/${data.file}`)} key={i} className={`flex items-start justify-between gap-4 cursor-pointer py-4 ${i < 4 ? "border-b border-gray-800" : ""}`}>
                  <div className="flex-1 min-w-0">
                    <div className="text-base text-slate-200 font-semibold">{data?.description?.slice(0,50)}...</div>
                    <div className="text-sm text-slate-500 mt-1">{data?.file} · line {data?.line}</div>
                    <div className="text-sm text-slate-400 mt-1">{data?.suggestion?.slice(0,50)}...</div>
                  </div>
                  <span className={`text-sm px-3 py-1 rounded-full border font-semibold flex-shrink-0 ${checkSeverity(data?.severity)}`}>{data?.severity}</span>
                </div>
              ))}
            </div></>
         )}
      </div>
        )}

        {activeTab === "Analysis" && (
        <div className="flex flex-col gap-4">
        {!analysisData ? (
         <div className="flex flex-col items-center justify-center min-h-[300px] gap-4 bg-gray-900 border border-gray-700 rounded-2xl p-8">
           <div className="text-5xl">⚙</div>
           <div className="text-xl font-bold text-slate-100">No analysis yet</div>
           <div className="text-base text-slate-400">Go to Repos page and click Analyze</div>
         </div>
       ) : (
       <>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <div className="bg-gray-900 border border-gray-700 rounded-2xl p-5">
             <div className="text-xs text-slate-500 uppercase tracking-widest mb-2">Complexity</div>
             <div className={`text-2xl font-bold ${
               analysisData?.complexity === "high" ? "text-red-400" :
               analysisData?.complexity === "medium" ? "text-amber-400" :
               "text-green-400"}`}>
               {analysisData?.complexity}
             </div>
           </div>
           <div className="bg-gray-900 border border-gray-700 rounded-2xl p-5 md:col-span-2">
             <div className="text-xs text-slate-500 uppercase tracking-widest mb-2">Tech Stack</div>
             <div className="flex flex-wrap gap-2 mt-1">
               {analysisData?.techStack?.map((tech, i) => (
                 <span key={i} className="bg-gray-800 border border-gray-600 text-slate-300 text-sm px-3 py-1 rounded-full font-medium">
                   {tech}
                 </span>
               ))}
             </div>
           </div>
         </div>
         <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
           <div className="text-xs text-slate-500 uppercase tracking-widest mb-3">Summary</div>
           <div className="text-base text-slate-200 leading-relaxed">{analysisData?.summary}</div>
         </div>
         <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
           <div className="text-xs text-slate-500 uppercase tracking-widest mb-3">Architecture</div>
           <div className="text-base text-slate-200 leading-relaxed whitespace-pre-line">{analysisData?.architecture}</div>
         </div>
 
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
             <div className="text-xs text-slate-500 uppercase tracking-widest mb-3">Folder Structure</div>
            <pre className="text-sm text-slate-300 leading-relaxed bg-gray-800 rounded-xl p-4 overflow-x-auto whitespace-pre-wrap">
              {analysisData?.folderStructure}
            </pre>
           </div>
 
           <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
             <div className="text-xs text-slate-500 uppercase tracking-widest mb-3">API Flow</div>
             <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
               {analysisData?.apiFlow}
             </div>
           </div>
         </div>
      </>
      )}
  </div>
        )}

      {activeTab === "File Summaries" && (
      <div className="flex flex-col gap-5">
       {!filesData ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-4 bg-gray-800 border border-gray-700 rounded-2xl p-8">
        <div className="text-5xl">☰</div>
        <div className="text-xl font-bold text-slate-100">No file summaries yet</div>
        <div className="text-base text-slate-400">Generate summaries for all files in this repo</div>
        <button
          onClick={handleGenerateSummaries}
          disabled={generating}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-xl px-6 py-3 text-base font-semibold text-white cursor-pointer transition-colors"
        >
          {generating ? "Generating..." : "☰ Generate File Summaries"}
        </button>
      </div>
    ) : (
      <>
        <div className="flex justify-between items-center">
          <div className="text-lg font-bold text-slate-100">Total: {filesData?.length} files</div>
          <div className="flex gap-2">
            <button
              onClick={handleGenerateSummaries}
              disabled={generating}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-xl px-4 py-2 text-sm font-semibold text-white cursor-pointer"
            >
              {generating ? "Generating..." : "Generate Summaries"}
            </button>
            <button
              onClick={handleGenerateEmbeddings}
              disabled={embeddingLoading}
              className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 rounded-xl px-4 py-2 text-sm font-semibold text-white cursor-pointer"
            >
              {embeddingLoading ? "Generating..." : "Generate Embeddings"}
            </button>
          </div>
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setSearchResults(null); }}
            placeholder="Search files by name or summary..."
            className="flex-1 bg-gray-900 border border-gray-700 focus:border-blue-500 rounded-xl px-4 py-3 text-base text-slate-200 outline-none placeholder-slate-500 transition-colors"
          />
        </div>

       <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
  <div className="text-lg font-bold text-slate-100 mb-4">
    {searchResults !== null ? `${searchResults.length} results found` : "All Files"}
  </div>

  {(searchResults !== null && searchResults.length === 0) ? (
    <div className="flex flex-col items-center justify-center py-10 gap-3">
      <div className="text-base font-semibold text-slate-300">No files found</div>
    </div>
  ) : (
    (searchResults || filesData)?.map((file, i) => (
      <div
        key={file._id}
        onClick={() => navigate(`/repos/${repoId}/file/${file._id}`)}
        className={`flex items-start gap-4 cursor-pointer py-4 hover:bg-gray-800 rounded-xl px-3 transition-colors ${i < (searchResults || filesData).length - 1 ? "border-b border-gray-800" : ""}`}
      >
        <div className="w-9 h-9 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center text-base flex-shrink-0">☰</div>
        <div className="flex-1 min-w-0">
          <div className="text-base font-semibold text-slate-200">{file?.fileName}</div>
          <div className="text-sm text-slate-500 mt-0.5">{file?.filePath}</div>
          <div className="text-sm text-slate-400 mt-1 line-clamp-2">{file?.summary?.slice(0, 80) ?? "No summary yet"}...</div>
        </div>
        <div className="text-xs text-slate-500 flex-shrink-0 mt-1">{getTime(file?.createdAt)}</div>
      </div>
    ))
  )}
</div>
      </>
    )}
  </div>
)}

        {activeTab === "Commits" && (
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
            {!historyData ? 
            (
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-4 bg-gray-900 border border-gray-700 rounded-2xl p-8">
                <div className="text-5xl">⛨</div>
                <div className="text-xl font-bold text-slate-100">No Commits yet</div>
                <div className="text-base text-slate-400">Run commmits button to find all commits</div>
                <button
                    onClick={handleCommits}
                    disabled={find}
                    className="bg-blue-500 hover:bg-blue-700 disabled:opacity-50 rounded-xl px-6 py-3 text-base font-semibold text-white cursor-pointer transition-colors"
                >
                    {find ? "Scanning..." : "⛨ Find Commits"}
                </button>
            </div>
       ):(
        <>
        <div className="text-lg font-bold text-slate-100 mb-5">Commit history</div>
            {historyData?.commits?.map((commit, i) => (
              <div key={i} className={`flex items-start gap-4 py-4 ${i < 4 ? "border-b border-gray-800" : ""}`}>
                <div className="w-2.5 h-2.5 rounded-full bg-green-400 flex-shrink-0 mt-2" />
                <div className="flex-1 min-w-0">
                  <div className="text-base font-semibold text-slate-200">{commit?.message}</div>
                  <div className="text-sm text-slate-500 mt-1">{commit?.author} · {getTime(commit?.date)} · 3 files changed</div>
                </div>
                <button className="text-sm text-blue-400 hover:text-blue-300 flex-shrink-0 cursor-pointer font-semibold" onClick={() => navigate(`/repos/${repoId}/commit/${commit.sha}`)}>
                  Analyze →
                </button>
              </div>
            ))}
        </>
       )}
          </div>
        )}
       {activeTab === "Dependency Graph" && (
  <div className="flex flex-col gap-5">
    <GetGraph repoId={repoId} />
    
    {!formattedGraph ? (
      <div className="flex flex-col items-center justify-center min-h-[350px] gap-4 bg-gray-900 border border-gray-700 rounded-2xl p-8">
        <div className="text-5xl">◎</div>
        <div className="text-xl font-bold text-slate-100">No dependency graph yet</div>
        <div className="text-base text-slate-400">Generate the dependency graph for this repo</div>
        <button
          onClick={handleGenerateGraph}
          disabled={generatingGraph}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-xl px-6 py-3 text-base font-semibold text-white cursor-pointer transition-colors"
        >
          {generatingGraph ? "Generating..." : "◎ Generate Graph"}
        </button>
      </div>
    ) : (
      <>
        <div className="flex justify-between items-center">
          <div className="text-lg font-bold text-slate-100">Dependency Graph</div>
          <button
            onClick={handleGenerateGraph}
            disabled={generatingGraph}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-xl px-4 py-2 text-sm font-semibold text-white cursor-pointer"
          >
            {generatingGraph ? "Regenerating..." : "⟳ Regenerate"}
          </button>
        </div>
        <div className="flex gap-5">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span className="text-sm text-slate-400">Local files</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
            <span className="text-sm text-slate-400">External packages</span>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-700 rounded-2xl overflow-hidden" style={{height: "500px"}}>
   <ForceGraph2D
    graphData={formattedGraph}
    nodeColor={(node) => node.type === "external" ? "#6366f1" : "#10b981"}
    linkColor={() => "#4b5563"}
    linkDirectionalArrowLength={4}
    linkDirectionalArrowRelPos={1}
    backgroundColor="#111827"
    d3AlphaDecay={0.02}
    d3VelocityDecay={0.3}
    cooldownTicks={100}
    nodeCanvasObject={(node, ctx, globalScale) => {
        const label = node.id.length > 10 ? node.id.slice(0, 10) + "..." : node.id;
        const fontSize = Math.max(3, 10 / globalScale);
        ctx.font = `${fontSize}px Sans-Serif`;
        const textWidth = ctx.measureText(label).width;
        const radius = Math.max(8, textWidth / 2 + 6);
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = node.type === "external" ? "#6366f1" : "#10b981";
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(label, node.x, node.y);
    }}
    nodeCanvasObjectMode={() => "replace"}
    onNodeClick={(node) => handleNodeClick(node)}
    d3Force={("charge", (force) => force.strength(-300))}
    linkDistance={100}
    />
        </div>
        {nodeData && (
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-5">
            <div className="flex justify-between items-center mb-3">
              <div className="text-base font-bold text-slate-100">
                {nodeData?.fileId?.fileName} — Dependencies
              </div>
              <button
                onClick={() => dispatch(setNodeData(null))}
                className="text-slate-400 hover:text-white text-lg cursor-pointer"
              >✕</button>
            </div>
            <div className="flex gap-3 mb-3">
              <span className="text-sm text-slate-400">
                Total: {nodeData?.dependencies?.length} dependencies
              </span>
              <span className="text-sm text-emerald-400">
                {nodeData?.dependencies?.filter(d => d.importType === "local").length} local
              </span>
              <span className="text-sm text-indigo-400">
                {nodeData?.dependencies?.filter(d => d.importType === "external").length} external
              </span>
            </div>
            {nodeData?.dependencies?.map((dep, i) => (
              <div key={i} className={`flex items-center justify-between py-2.5 ${i < nodeData.dependencies.length - 1 ? "border-b border-gray-800" : ""}`}>
                <span className="text-sm text-slate-300">{dep.importedFileName}</span>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${dep.importType === "external" ? "bg-indigo-950 text-indigo-400 border border-indigo-900" : "bg-emerald-950 text-emerald-400 border border-emerald-900"}`}>
                  {dep.importType}
                </span>
              </div>
            ))}
          </div>
        )}
      </>
    )}
  </div>
)}
       {activeTab === "Chat" && <ChatTab repoId={repoId} />}
       
    {activeTab === "Time Machine" && (
  <div className="flex flex-col gap-4 h-[calc(100vh-280px)] min-h-[500px]">
    <div className="bg-gray-900 border border-gray-700 rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-1">
        <span className="text-2xl">🕰</span>
        <p className="text-lg font-bold text-slate-100">Time Machine</p>
      </div>
      <p className="text-sm text-slate-400 ml-9">Ask anything about your commit history</p>
    </div>
    <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1">
      {timeMachineHistory?.length === 0 && !tmAsking && (
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 flex flex-col items-center gap-3 text-center">
          <p className="text-4xl">🕰</p>
          <p className="text-base font-semibold text-slate-200">Ask about your commit history</p>
          <p className="text-sm text-slate-500">e.g. "When was auth added?" or "What changed last week?"</p>
        </div>
      )}

      {timeMachineHistory?.map((item, i) => (
        <div key={i} className="flex flex-col gap-2">
          <div className="flex justify-end">
            <div className="max-w-[80%] bg-blue-600 text-white px-4 py-2.5 text-sm rounded-2xl rounded-br-sm leading-relaxed">
              {item.question}
            </div>
          </div>
          <div className="flex justify-start">
            <div className="max-w-[85%] bg-gray-900 border border-gray-700 text-slate-200 px-4 py-2.5 text-sm rounded-2xl rounded-bl-sm leading-relaxed whitespace-pre-line">
              {item.answer}
            </div>
          </div>
        </div>
      ))}

      {tmAsking && (
        <div className="flex justify-start">
          <div className="bg-gray-900 border border-gray-700 text-slate-400 px-4 py-2.5 text-sm rounded-2xl rounded-bl-sm">
            Searching commit history...
          </div>
        </div>
      )}
    </div>
    <div className="bg-gray-900 border border-gray-700 rounded-2xl p-4">
      {tmCreditsExhausted ? (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-amber-950 border border-amber-800 rounded-xl px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-amber-400">Credits exhausted</p>
            <p className="text-xs text-amber-600 mt-0.5">Upgrade to Pro to keep using Time Machine</p>
          </div>
          <button
            onClick={() => navigate("/subscription")}
            className="bg-amber-500 hover:bg-amber-400 rounded-lg px-4 py-2 text-sm font-semibold text-white cursor-pointer transition-colors"
          >
            Upgrade →
          </button>
        </div>
      ) : (
        <>
          <div className="flex gap-2">
            <input
              type="text"
              value={tmQuestion}
              onChange={(e) => setTmQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !tmAsking && tmQuestion.trim() && handleTimeMachine()}
              placeholder="When was authentication added?"
              disabled={tmAsking}
              className="flex-1 bg-gray-800 border border-gray-700 focus:border-amber-500 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none placeholder-slate-500 transition-colors disabled:opacity-50 min-w-0"
            />
            <button
              onClick={handleTimeMachine}
              disabled={tmAsking || !tmQuestion.trim()}
              className="bg-amber-600 hover:bg-amber-500 disabled:opacity-40 rounded-xl px-5 py-2.5 text-sm font-semibold text-white cursor-pointer transition-colors flex-shrink-0"
            >
              {tmAsking ? "..." : "Ask"}
            </button>
          </div>
        </>
      )}
    </div>

  </div>
)}

  {activeTab === "Refactor" && (
  <div className="flex flex-col gap-4">

    {!suggestions || suggestions.length === 0 ? (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-4 bg-gray-900 border border-gray-700 rounded-2xl p-8">
        <div className="text-5xl">⟳</div>
        <p className="text-xl font-bold text-slate-100">
          No suggestions yet
        </p>
        <p className="text-base text-slate-400">
           refactor suggestions 
        </p>

        <button
          onClick={handleGenerateSuggestions}
          disabled={generating}
          className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 rounded-xl px-6 py-3 text-base font-semibold text-white cursor-pointer transition-colors"
        >
          {generating ? "Analyzing..." : "⟳ Generate Suggestions"}
        </button>
      </div>
    ) : (
      <>
        <div className="flex flex-wrap justify-between items-center gap-3">
          <div>
            <p className="text-xl font-bold text-slate-100">
              Refactor Suggestions
            </p>
            <p className="text-md text-slate-400 mt-0.5">
              Total: {suggestions.length} suggestions
            </p>
          </div>

          <div className="flex gap-2 flex-wrap">
            <select
              value={refactorFilter}
              onChange={(e) => setRefactorFilter(e.target.value)}
              className="bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-md text-slate-300 outline-none cursor-pointer"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="applied">Applied</option>
              <option value="ignored">Ignored</option>

              {suggestionTypes.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>

            <button
              onClick={handleGenerateSuggestions}
              disabled={generating}
              className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 rounded-xl px-4 py-2 text-md font-bold text-white cursor-pointer transition-colors"
            >
              {generating ? "Analyzing..." : "⟳ Regenerate"}
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          {(refactorFilter === "all"
            ? suggestions
            : suggestions.filter(
                (s) =>
                  s.status === refactorFilter ||
                  s.type === refactorFilter
              )
          ).map((s, i) => (
            <div
              key={s._id || i}
              className="bg-gray-900 border border-gray-700 rounded-2xl p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div className="flex flex-wrap gap-2">

                  <span
                    className={`text-md px-2.5 py-1 rounded-full font-semibold border ${
                      typeColors[s.type] ||
                      "bg-amber-950 text-amber-400 border-amber-900"
                    }`}
                  >
                    {s.type}
                  </span>

                  <span
                    className={`text-md px-2.5 py-1 rounded-full font-semibold border
                    ${
                      s.priority === "high"
                        ? "bg-red-950 text-red-400 border-red-900"
                        : s.priority === "medium"
                        ? "bg-amber-950 text-amber-400 border-amber-900"
                        : "bg-green-950 text-green-400 border-green-900"
                    }`}
                  >
                    {s.priority}
                  </span>
                  <span
                    className={`text-md px-2.5 py-1 rounded-full font-semibold border
                    ${
                      s.status === "applied"
                        ? "bg-green-950 text-green-400 border-green-900"
                        : s.status === "ignored"
                        ? "bg-slate-800 text-slate-400 border-slate-700"
                        : "bg-gray-800 text-slate-400 border-gray-700"
                    }`}
                  >
                    {s.status}
                  </span>
                </div>
                {s.status === "pending" && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleApply(s._id)}
                      className="bg-green-600 hover:bg-green-500 rounded-lg px-3 py-1.5 text-md font-semibold text-white cursor-pointer transition-colors"
                    >
                      Apply
                    </button>

                    <button
                      onClick={() => handleIgnore(s._id)}
                      className="bg-gray-700 hover:bg-gray-600 rounded-lg px-3 py-1.5 text-md font-semibold text-slate-300 cursor-pointer transition-colors"
                    >
                      Ignore
                    </button>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {s.files?.map((file, index) => (
                  <span
                    key={index}
                    className="text-sm bg-gray-800 border border-gray-700 text-slate-400 px-2 py-1 rounded-lg"
                  >
                    ☰ {file}
                  </span>
                ))}
              </div>
              <p className="text-md font-semibold text-slate-200 mb-1">
                {s.description}
              </p>

              <p className="text-md text-slate-400 mb-3">
                {s.suggestion}
              </p>
              {s.codeSnippet && (
                <pre className="text-md text-slate-300 bg-gray-800 border border-gray-700 rounded-xl p-3 overflow-x-auto whitespace-pre-wrap">
                  {s.codeSnippet}
                </pre>
              )}
            </div>
          ))}
        </div>
      </>
    )}
  </div>
)}

      </div>
    </div>
    </>
  );
};

export default RepoPage;
