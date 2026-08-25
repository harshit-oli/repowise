import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { serverUrl } from '../App';

const Main = () => {

  const [stats, setStats] = useState(null);

useEffect(() => {
    const fetchStats = async () => {
        const res = await axios.get(`${serverUrl}/api/stats`,{withCredentials:true});
        console.log(res.data);
        setStats(res.data);
    };
    fetchStats();
    }, []);
  return (
    <div className='flex flex-col justify-center items-center text-center'>
    <div className='flex flex-col justify-center items-center text-center px-4 py-16 md:py-24'>
      
      <div className='flex flex-col gap-2 mb-6'>
        <span className='text-3xl md:text-6xl text-white font-bold'>
          Understand any codebase
        </span>
        <span className='text-3xl md:text-6xl text-blue-400 font-bold'>
          in minutes
        </span>
      </div>
      <p className='text-gray-300/80 text-sm md:text-lg max-w-xl mb-8 opecity'>
        Paste a GitHub URL and get instant architecture analysis, dependency graphs, security scans, and an AI assistant that answers questions about your code.
      </p>
       <div className='flex flex-col gap-3 md:flex-row justify-center items-center'>
    <input 
        type="text" 
        placeholder="https://github.com/username/repo"
        className='p-3 w-[290px] md:w-[550px] rounded-md border border-gray-600 bg-transparent text-white outline-none'
    />
    <button className='px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 cursor-pointer'>
        Analyze repo →
    </button>
  </div>
    </div>
  <div className='flex flex-col mt-[30px] w-[100%] sm:w-[80%]' >
  <div className='bg-white/20 h-[1.5px]'></div>
  <div className='h-[150px] flex gap-1.5 justify-around items-center text-center'>
  <div>
      <h2 className='text-white font-bold text-[15px] md:text-3xl'>{stats?.totalRepos ?? 0}+</h2>
      <p className='text-white/70 font-bold text-[12px] md:text-xl pt-1'>Repo Analysed</p>
  </div>
    <div><h2 className='text-white font-bold text-[15px] md:text-3xl'>{stats?.securityStats?.[0]?.totalIssues ?? 0}+</h2>
     <p className='text-white/70 font-bold  text-[12px] md:text-xl pt-1'>Security issues found</p>
    </div>
    <div><h2 className='text-white font-bold text-[15px] md:text-3xl'>{stats?.securityStats?.[0]?.avgScore ?? 0}%</h2>
     <p className='text-white/70 font-bold md:text-xl text-[12px] pt-1'>Accuracy rate</p>
    </div>
    <div>
      <h2 className='text-white font-bold text-[15px] md:text-3xl'>&lt;{Math.ceil((stats?.securityStats?.[0]?.avgScanTime ?? 0) / 60000)} min</h2>
       <p className='text-white/70 font-bold text-[12px] md:text-xl pt-1'>Average scan time</p>
  </div>
    </div>
  <div className='bg-white/20 h-[1.5px]'></div>
 </div>
  <div className='flex flex-col justify-start items-start w-[70%] mt-[70px] gap-[10px]'>
    <p className='text-blue-500 font-bold'>Features</p>
    <h1 className='text-2xl md:text-4xl text-white font-bold'>Everything you need to understand code</h1>
    <p className='text-white md:text-xl font-bold mb-6'>From architecture overview to team collaboration-all in one place.</p>
   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <div className="bg-[#1c1c1c]/30 border border-gray-700 rounded-2xl p-7 hover:border-gray-500 transition duration-300">
        <div className="w-14 h-14 rounded-xl bg-[#e8e4ff] flex items-center justify-center mb-6">
          🏢
        </div>
        <h2 className="text-white text-2xl font-semibold mb-4">
         Architecture Analysis
        </h2>
        <p className="text-gray-400 leading-8 text-lg">
          Complete overview of system design,folder structure,and tech stack
        </p>
      </div>
    <div className="bg-[#1c1c1c]/30 border border-gray-700 rounded-2xl p-7 hover:border-gray-500 transition duration-300">
        <div className="w-14 h-14 rounded-xl bg-[#e8e4ff] flex items-center justify-center mb-6">
          📊
        </div>
        <h2 className="text-white text-2xl font-semibold mb-4">
          Dependency graph
        </h2>
        <p className="text-gray-400 leading-8 text-lg">
          Visualize how files connect and dependent each other interactivity.
        </p>
      </div>
   <div className="bg-[#1c1c1c]/30 border border-gray-700 rounded-2xl p-7 hover:border-gray-500 transition duration-300">
        <div className="w-14 h-14 rounded-xl bg-[#e8e4ff] flex items-center justify-center mb-6">
          🔐
        </div>
        <h2 className="text-white text-2xl font-semibold mb-4">
          Security Scan
        </h2>
        <p className="text-gray-400 leading-8 text-lg">
         Detect hardcoded secrets,XSS vulnerabilities,and weak auth patterns.
        </p>
      </div>
    <div className="bg-[#1c1c1c]/30 border border-gray-700 rounded-2xl p-7 hover:border-gray-500 transition duration-300">
        <div className="w-14 h-14 rounded-xl bg-[#e8e4ff] flex items-center justify-center mb-6">
          💬
        </div>
        <h2 className="text-white text-2xl font-semibold mb-4">
          Chat with repo
        </h2>
        <p className="text-gray-400 leading-8 text-lg">
          Ask questions in plain language and get answers from your codebase.
        </p>
      </div>
    <div className="bg-[#1c1c1c]/30 border border-gray-700 rounded-2xl p-7 hover:border-gray-500 transition duration-300">
        <div className="w-14 h-14 rounded-xl bg-[#e8e4ff] flex items-center justify-center mb-6">
           🔗
        </div>
        <h2 className="text-white text-2xl font-semibold mb-4">
          Commit history
        </h2>
        <p className="text-gray-400 leading-8 text-lg">
          Analyze what changed, when, and why with AI-powered explanations.
        </p>
      </div>
   <div className="bg-[#1c1c1c]/30 border border-gray-700 rounded-2xl p-7 hover:border-gray-500 transition duration-300">
        <div className="w-14 h-14 rounded-xl bg-[#e8e4ff] flex items-center justify-center mb-6">
          💬
        </div>
        <h2 className="text-white text-2xl font-semibold mb-4">
          Chat with repo
        </h2>
        <p className="text-gray-400 leading-8 text-lg">
          Ask questions in plain language and get answers from your codebase.
        </p>
      </div>
   <div className="bg-[#1c1c1c]/30 border border-gray-700 rounded-2xl p-7 hover:border-gray-500 transition duration-300">
        <div className="w-14 h-14 rounded-xl bg-[#e8e4ff] flex items-center justify-center mb-6">
           ⏰
        </div>
        <h2 className="text-white text-2xl font-semibold mb-4">
            Time machine
        </h2>
        <p className="text-gray-400 leading-8 text-lg">
          Query your repo’s past — “what changed in auth in last few months?”
        </p>
      </div>
<div className="bg-[#1c1c1c]/30 border border-gray-700 rounded-2xl p-7 hover:border-gray-500 transition duration-300">
        <div className="w-14 h-14 rounded-xl bg-[#e8e4ff] flex items-center justify-center mb-6">
          💳
        </div>
        <h2 className="text-white text-2xl font-semibold mb-4">
         Subscription plans
        </h2>
        <p className="text-gray-400 leading-8 text-lg">
            Flexible plans for individuals and teams — free, pro, and enterprise.
        </p>
      </div>
  <div className="bg-[#1c1c1c]/30 border border-gray-700 rounded-2xl p-7 hover:border-gray-500 transition duration-300">
        <div className="w-14 h-14 rounded-xl bg-[#e8e4ff] flex items-center justify-center mb-6">
          👥
        </div>
        <h2 className="text-white text-2xl font-semibold mb-4">
          Team collaboration
        </h2>
        <p className="text-gray-400 leading-8 text-lg">
          Invite teammates, assign roles, and work on repos together.
        </p>
      </div>
</div>
  </div>

    <div className='flex flex-col justify-start items-start w-[70%] mt-[50px] gap-[10px] bg-gray-900 p-[20px] rounded-xl'>
      <p className='text-blue-500 font-bold'>How it works</p>
      <h1 className='text-2xl md:text-4xl text-white font-bold'>Three steps to full code clearity</h1>
      <div className='flex flex-col gap-6 md:flex-row justify-around items-center mt-6 w-full'>
        <div className='flex flex-col gap-2 justify-start items-start'>
          <div className='rounded-full bg-gray-200 w-14 h-14 flex items-center justify-center'>1</div>
          <h1 className='text-white text-xl font-bold'>Paste your GitHub URL</h1>
          <p className='flex flex-col text-gray-200/50 font-bold items-start'><span>Any public or private repo-</span><span>we fetch Everything</span><span>automatically</span></p>
        </div>
          <div className='flex flex-col gap-2 justify-start items-start'>
          <div className='rounded-full bg-gray-200 w-14 h-14 flex items-center justify-center'>2</div>
          <h1 className='text-white text-xl font-bold'>AI analyzes everything</h1>
          <p className='flex flex-col text-gray-200/50 font-bold items-start'><span>Files are indexed,embedded,</span><span>and analyzed across all</span><span>dimensions</span></p>
          </div>
          <div className='flex flex-col gap-2 justify-start items-start'>
          <div className='rounded-full bg-gray-200 w-14 h-14 flex items-center justify-center'>3</div>
          <h1 className='text-white text-xl font-bold'>Explore and ask anything</h1>
          <p className='flex flex-col text-gray-200/50 font-bold items-start'><span>Use the dashboard,graph,</span><span>scanner,and chat to</span><span>understand your code.</span></p>
        </div>
      </div>
  </div>

<section className="w-[70%] text-white py-14">

  <div className="flex flex-col justify-start items-start gap-4 mb-12">
    <p className="text-blue-500 font-semibold">
      Preview
    </p>

    <h1 className="text-4xl md:text-5xl font-bold">
      What you'll see inside
    </h1>
  </div>

  <div className="w-full border border-zinc-800 rounded-3xl overflow-hidden bg-zinc-950">
    <div className="flex items-center gap-3 px-6 py-4 border-b border-zinc-800">
      <div className="w-3 h-3 rounded-full bg-red-500"></div>
      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
      <div className="w-3 h-3 rounded-full bg-green-500"></div>

      <p className="ml-4 text-zinc-400 font-medium">
        GitMind
      </p>
    </div>
   <div className="flex flex-col md:flex-row w-full">
  <div className="w-full md:w-[280px] border-b md:border-b-0 md:border-r border-zinc-800 p-4 md:p-6">

    <div className="flex md:hidden gap-3 overflow-x-auto">

      <button className="bg-zinc-200 text-black px-4 py-2 rounded-xl whitespace-nowrap font-medium">
        Overview
      </button>

      <button className="text-zinc-400 border border-zinc-800 px-4 py-2 rounded-xl whitespace-nowrap">
        Dependency graph
      </button>

      <button className="text-zinc-400 border border-zinc-800 px-4 py-2 rounded-xl whitespace-nowrap">
        Security scan
      </button>

      <button className="text-zinc-400 border border-zinc-800 px-4 py-2 rounded-xl whitespace-nowrap">
        Chat
      </button>

      <button className="text-zinc-400 border border-zinc-800 px-4 py-2 rounded-xl whitespace-nowrap">
        Commits
      </button>

    </div>
    <div className="hidden md:flex flex-col gap-4">

      <button className="bg-zinc-200 text-black px-4 py-3 rounded-xl text-left font-medium">
        Overview
      </button>

      <button className="text-zinc-400 text-left px-4 py-3 hover:text-white transition">
        Dependency graph
      </button>

      <button className="text-zinc-400 text-left px-4 py-3 hover:text-white transition">
        Security scan
      </button>

      <button className="text-zinc-400 text-left px-4 py-3 hover:text-white transition">
        Chat
      </button>

      <button className="text-zinc-400 text-left px-4 py-3 hover:text-white transition">
        Commits
      </button>

    </div>

  </div>

  {/* RIGHT CONTENT */}
  <div className="flex-1 p-4 md:p-6 flex flex-col gap-6">

    <div className="bg-zinc-900 rounded-2xl p-4 md:p-6 border border-zinc-800">
      <h2 className="text-zinc-400 font-semibold mb-3">
        Summary
      </h2>

      <p className="text-lg md:text-2xl font-semibold leading-relaxed">
        A full-stack social media application built with the MERN stack,
        featuring real-time chat via Socket.IO and JWT-based authentication.
      </p>
    </div>

    <div className="bg-zinc-900 rounded-2xl p-4 md:p-6 border border-zinc-800">

      <h2 className="text-zinc-400 font-semibold mb-4">
        Tech stack
      </h2>

      <div className="flex gap-3 flex-wrap">

        <span className="bg-zinc-200 text-black px-4 py-2 rounded-full text-sm font-medium">
          React
        </span>

        <span className="bg-zinc-200 text-black px-4 py-2 rounded-full text-sm font-medium">
          Node.js
        </span>

        <span className="bg-zinc-200 text-black px-4 py-2 rounded-full text-sm font-medium">
          MongoDB
        </span>

        <span className="bg-zinc-200 text-black px-4 py-2 rounded-full text-sm font-medium">
          Socket.IO
        </span>

        <span className="bg-zinc-200 text-black px-4 py-2 rounded-full text-sm font-medium">
          JWT
        </span>

      </div>

    </div>

  </div>

</div>

  </div>

</section>


<section className="w-[70%] text-white py-10">

  <div className="flex flex-col items-center text-center gap-6">

    <h1 className="text-4xl md:text-5xl font-bold max-w-5xl leading-tight">
      Ready to understand your codebase?
    </h1>

    <p className="text-zinc-400 text-xl max-w-3xl">
      Join thousands of developers who use RepoWise to ship faster and safer.
    </p>

    <div className="flex gap-5 mt-6">

      <button className="bg-white text-black px-8 py-4 rounded-2xl text-lg font-semibold hover:scale-105 transition">
        Start for free
      </button>

      <button className="border border-zinc-700 px-8 py-4 rounded-2xl text-lg hover:bg-zinc-900 transition">
        View demo
      </button>

    </div>

  </div>

</section>
</div>
  )
}

export default Main
