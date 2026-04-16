import React from 'react'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom'

const Login = () => {
    const [email,setEmail]=useState("");
    const [password,setPassword]=useState("");
    const navigate=useNavigate()
  return (
    <div className='flex flex-col items-center justify-center mt-[25vh]'>
  
  <div className='flex flex-col gap-4 items-center bg-gray-200 shadow-xl p-20 rounded-2xl w-[400px]'>

    <div className='flex flex-col items-center justify-center'>
      <div className='font-bold text-2xl'>Welcome back</div>
      <div className='text-gray-500'>Login to your account</div>
    </div>
    <div className='flex flex-col items-center justify-center gap-2'>
      <div className='bg-black text-white px-4 py-2 rounded-lg cursor-pointer'>
        Sign In with Github
      </div>
      <div className='text-gray-400'>or with email</div>
    </div>

    <div className='flex flex-col gap-3 w-full'>
      <input 
        type="email" 
        placeholder='Enter Your Email' 
        className='border rounded-md outline-none p-2 w-full focus:ring-2 focus:ring-black'
      />
      <input 
        type="password" 
        placeholder='Enter Your Password' 
        className='border rounded-md outline-none p-2 w-full focus:ring-2 focus:ring-black'
      />
    </div>
    <div className='flex flex-col items-center justify-center gap-1'>
        <button className='bg-black text-white px-6 py-2 rounded-lg '>Sign In</button>
        <p>Already registered? <span className='text-blue-600 underline cursor-pointer' onClick={()=>navigate("/signup")}>Sign Up</span></p>
    </div>

  </div>

</div>
  )
}

export default Login
