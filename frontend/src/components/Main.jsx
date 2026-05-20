import React from 'react'

const Main = () => {
  return (
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
  )
}

export default Main
