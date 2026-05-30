import { useEffect, useState } from "react";
import GetRepos from "../hooks/GetRepos";
import { useSelector } from "react-redux";
import GetScanResult from "../hooks/GetScanResult";
import GetHistory from "../hooks/GetHistory";
import axios from "axios";
import { serverUrl } from "../App";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [activePage, setActivePage] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const {repoData}= useSelector(state=>state.repo);
  const {scanData}=useSelector(state=>state.security);
  const {historyData}=useSelector(state=>state.commits);
   const {userData}=useSelector(state=>state.user);
   const [stats, setStats] = useState(null);
   const navigate = useNavigate();

const navItems = [
    { section: "Main", items: [
      { name: "Dashboard", icon: "⊞", route: "/dashboard" },
      { name: "Repos", icon: "⎇", route: "/repos" },
    ]},
    { section: "Analysis", items: [
      { name: "Analysis", icon: "⚙", route: "/analysis" },
      { name: "Dependency graph", icon: "◎", route: "/dependency" },
      { name: "File summaries", icon: "☰", route: "/files" },
    ]},
    { section: "Tools", items: [
      { name: "Security scan", icon: "⛨", route: "/security" },
      { name: "Chat with repo", icon: "◻", route: "/chat" },
      { name: "Time machine", icon: "◷", route: "/timemachine" },
      { name: "Refactor", icon: "⟳", route: "/refactor" },
    ]},
    { section: "Team & Billing", items: [
      { name: "Team", icon: "◈", route: "/team" },
      { name: "Subscription", icon: "◇", route: "/subscription" },
    ]},
];

  
  useEffect(() => {
      const fetchStats = async () => {
          const res = await axios.get(`${serverUrl}/api/stats`,{withCredentials:true});
          console.log(res.data);
          setStats(res.data);
      };
      fetchStats();
      }, []);

const getTime = (date) => {
    if(!date) return "Never analyzed";
    const diff = Date.now() - new Date(date);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if(hours < 1) return "Just now";
    if(hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if(days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    if(months < 12) return `${months}mo ago`;
    const years = Math.floor(months / 12);
    return `${years}y ago`;
}

const critical=scanData?.issues?.filter(i=>i.severity=="critical").length;
const high=scanData?.issues?.filter(i=>i.severity=="high").length;
const medium=scanData?.issues?.filter(i=>i.severity=="medium").length;
const low=scanData?.issues?.filter(i=>i.severity=="low").length;

const checkSeverity = (severity) => {
    if(severity === "critical") return "bg-red-950 text-red-400";
    else if(severity === "high") return "bg-amber-950 text-amber-400";
    else if(severity === "medium") return "bg-yellow-600 text-yellow-200";
    else return "bg-green-950 text-green-400";
}

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-gray-300">
      <div className="px-10 py-5 border-b border-gray-500">
        <div className="text-2xl font-bold text-gray-800 tracking-tight cursor-pointer" onClick={()=>navigate("/")}>
          <span className="font-bold">Git</span><span className=" text-blue-500 font-bold ">Mind</span>
        </div>
      </div>


      <div className="flex-1 overflow-y-auto py-2">
        {navItems.map((section) => (
          <div key={section.section}>
            <div className="text-[13px] text-gray-600 px-10 pt-3 pb-1 uppercase tracking-widest font-bold">
              {section.section}
            </div>
            {section.items.map((item) => (
              <div
                key={item.name}
                onClick={() => { setActivePage(item.name);
                   setSidebarOpen(false);
                   navigate(item.route);}}
                className={`flex items-center gap-2 px-10 py-2 text-md cursor-pointer transition-all
                  ${activePage === item.name
                    ? "bg-gray-300 text-gray-800 font-semibold border-l-4 border-gray-800"
                    : "text-gray-600 hover:bg-gray-300/50 border-l-4 border-transparent"
                  }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.name}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="px-4 py-3 border-t border-gray-500">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-sm font-semibold text-gray-100">H</div>
          <div>
            <div className="text-md font-semibold text-gray-800">{userData?.name}</div>
            <div className="text-sm text-gray-600">{userData?.usage?.planType}</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
     <GetRepos/>
     {repoData && <GetScanResult repoId={repoData?.[0]?._id}/>}
      {repoData && <GetHistory repoHistoryId={repoData?.[0]?._id}/>}
    <div className="flex min-h-screen bg-gray-800 text-white">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div className="hidden lg:flex lg:flex-col w-[300px] sticky top-0 h-screen flex-shrink-0 border-r border-gray-600">
        <Sidebar />
      </div>

      <div className={`fixed top-0 left-0 h-full w-[220px] z-30 flex flex-col transition-transform duration-300 lg:hidden
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <Sidebar />
      </div>

      <div className="flex-1 p-4 md:p-6 overflow-y-auto">

        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden text-slate-300 text-xl"
              onClick={() => setSidebarOpen(true)}
            >☰</button>
            <div>
              <div className="text-lg md:text-xl font-bold text-slate-100">Dashboard</div>
              <div className="text-sm text-slate-400 font-bold">Welcome back, Harshit</div>
            </div>
          </div>
          <button className="bg-gray-600 hover:bg-gray-500 text-slate-100 border-none rounded-lg px-3 md:px-4 py-2 text-xs md:text-sm font-medium cursor-pointer transition-colors">
            + Add repo
          </button>
        </div>
       <div className='h-[150px] flex gap-1.5 justify-around items-center text-center'>
       <div>
           <h2 className='text-white font-bold text-[15px] md:text-3xl'>{stats?.totalRepos ?? 0}+</h2>
           <p className='text-white/70 font-bold text-[12px] md:text-xl pt-1'>Total repo</p>
       </div>
       <div>
           <h2 className='text-white font-bold text-[15px] md:text-3xl'>{stats?.analyzedRepos ?? 0}+</h2>
           <p className='text-white/70 font-bold text-[12px] md:text-xl pt-1'>Repo Analysed</p>
       </div>
       <div><h2 className='text-white font-bold text-[15px] md:text-3xl'>{stats?.securityStats?.[0]?.totalIssues ?? 0}+</h2>
        <p className='text-white/70 font-bold  text-[12px] md:text-xl pt-1'>Security issues found</p>
       </div>
       <div><h2 className='text-white font-bold text-[15px] md:text-3xl'>{stats?.securityStats?.[0]?.avgScore ?? 0}%</h2>
        <p className='text-white/70 font-bold md:text-xl text-[12px] pt-1'>Accuracy rate</p>
       </div>
       </div>
        <div className="mb-5">
          <div className="flex justify-between items-center mb-3">
            <div className="text-md font-semibold text-white">Your repos</div>
            <span className="text-md text-slate-400 cursor-pointer hover:text-white">View all →</span>
          </div>
          <div className="flex flex-col gap-2">
            {repoData?.slice(0, 4).map((repo) => (
              <div key={repo.repoName} className="bg-gray-900 border border-gray-700 rounded-xl p-3 md:p-4 flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center text-base flex-shrink-0">⎇</div>
                  <div className="min-w-0">
                    <div className="text-md font-semibold text-white truncate">{repo?.repoName}</div>
                    <div className="text-sm text-white mt-0.5">{repo?.language} · {getTime(repo.lastAnalyzed)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-md px-2 py-1 rounded-full font-medium hidden sm:inline ${repo.status=="completed" ? "bg-green-950 text-green-400" : "bg-slate-800 text-slate-400"}`}>{repo.status}</span>
                  <button className="bg-transparent border border-gray-600 rounded-md px-3 py-2 text-md text-white cursor-pointer hover:text-slate-200 hover:border-gray-400 transition-colors">
                    {repo.status === "completed" ? "View" : "Analyze"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
            <div className="text-md font-semibold text-slate-100 mb-3">Security overview</div>
            <div className="flex items-center gap-3 mb-3">
              <div className="text-3xl font-bold text-green-400">{scanData?.score}</div>
              <div>
                <div className="text-md font-medium text-slate-100">Security score</div>
                <div className="text-sm text-slate-400">Latest scan</div>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap mb-3">
              <span className="text-sm px-2 py-1 rounded-full bg-red-950 text-red-400 font-medium">{critical} critical</span>
              <span className="text-sm px-2 py-1 rounded-full bg-amber-950 text-amber-400 font-medium">{high} high</span>
              <span className="text-sm px-2 py-1 rounded-full bg-green-950 text-yellow-400 font-medium">{medium} medium</span>
                            <span className="text-sm px-2 py-1 rounded-full bg-green-950 text-green-400 font-medium">{low} low</span>
            </div>
            {scanData?.issues.slice(0,4).map((issue,index) => (
               <div key={index} className={`flex items-center justify-between py-2 ${index < scanData?.issues?.length - 1 ? "border-b border-gray-800" : ""}`}>
                <div className="min-w-0 mr-2"> 
                <div className="text-md text-slate-200 truncate">
                {issue?.description.slice(0,40)}...
                <div className="text-md text-slate-500 mt-0.5 truncate">{issue.file} . line {issue.line}</div>
                </div>
                </div>
                <span className={`text-md px-2 py-1 rounded-full font-medium flex-shrink-0 ${checkSeverity(issue?.severity)}`}>{issue?.severity}</span>
              </div>
            ))}
          </div>
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
            <div className="text-md font-semibold text-slate-100 mb-3">Recent commits</div>
            {historyData?.commits?.slice(0,6).map((commit, i) => (
              <div key={i} className={`flex items-start gap-2 py-2 ${i < 4 ? "border-b border-gray-800" : ""}`}>
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0 mt-1.5" />
              <div className="flex-1 min-w-0">
              <div className="text-md text-slate-200 truncate">{commit?.message}</div>
              <div className="text-md text-slate-500 mt-0.5">{commit?.author} · {getTime(commit?.date)}</div>
             </div>
             <div className="text-md text-slate-500 flex-shrink-0">{commit?.filesChanged?.length} files</div>
              </div>
))}
          </div>
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 md:col-span-2 xl:col-span-1">
  <div className="text-md font-semibold text-slate-100 mb-3">Repo Health</div>
  <div className="flex flex-col gap-2">
    <div className="flex justify-between items-center py-2 border-b border-gray-800">
      <span className="text-md text-slate-400">Repo name</span>
      <span className="text-md text-slate-100 font-medium">{repoData?.[0]?.repoName}</span>
    </div>
    <div className="flex justify-between items-center py-2 border-b border-gray-800">
      <span className="text-md text-slate-400">Language</span>
      <span className="text-md text-slate-100 font-medium">{repoData?.[0]?.language}</span>
    </div>
    <div className="flex justify-between items-center py-2 border-b border-gray-800">
      <span className="text-md text-slate-400">Stars</span>
      <span className="text-md text-yellow-400 font-medium">⭐ {repoData?.[0]?.stars}</span>
    </div>
    <div className="flex justify-between items-center py-2 border-b border-gray-800">
      <span className="text-md text-slate-400">Forks</span>
      <span className="text-md text-slate-100 font-medium">⎇ {repoData?.[0]?.forks}</span>
    </div>
    <div className="flex justify-between items-center py-2 border-b border-gray-800">
      <span className="text-md text-slate-400">Size</span>
      <span className="text-md text-slate-100 font-medium">{repoData?.[0]?.size} KB</span>
    </div>
    <div className="flex justify-between items-center py-2 border-b border-gray-800">
      <span className="text-md text-slate-400">Status</span>
      <span className={`text-md px-2 py-1 rounded-full font-medium
        ${repoData?.[0]?.status === "completed" ? "bg-green-950 text-green-400" :
          repoData?.[0]?.status === "processing" ? "bg-amber-950 text-amber-400" :
          repoData?.[0]?.status === "failed" ? "bg-red-950 text-red-400" :
          "bg-slate-800 text-slate-400"}`}>
        {repoData?.[0]?.status}
      </span>
    </div>
    <div className="flex justify-between items-center py-2">
      <span className="text-md text-slate-400">Branch</span>
      <span className="text-md text-slate-100 font-medium">⎇ {repoData?.[0]?.defaultBranch}</span>
    </div>
  </div>
</div>
        </div>
      </div>
    </div>
  </>
  );
};

export default Dashboard;

