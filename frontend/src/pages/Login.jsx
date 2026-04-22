import axios from 'axios';
import React from 'react'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom'
import { setUserData } from '../redux/userSlice';
import { serverUrl } from '../App';
import { useDispatch } from 'react-redux';


const Login = () => {
    const [email,setEmail]=useState("");
    const [password,setPassword]=useState("");
    const dispatch=useDispatch();
    const navigate=useNavigate()
     const handleSignIn=async()=>{
        //    setLoading(true);
           try {
            const result=await axios.post(`${serverUrl}/api/auth/login`,{email,password},{withCredentials:true})
              console.log(result);
              dispatch(setUserData(result.data.user));
              navigate("/");
              console.log("DISPATCH CALLED");
           } catch (error) {
            console.log(error.response?.data?.message || error.message);
            // setLoading(false);
           }
        } 
  return (
   <div className='w-full h-screen flex flex-col justify-center items-center bg-gradient-to-b 
       from-black to-gray-900'>
     <div className='w-[90%] lg:max-w-[45%] h-[600px] bg-white rounded-2xl flex justify-center items-center overflow-hidden'>
  
  <div className='w-full lg:w-[50%] h-full bg-white flex flex-col justify-center items-center p-[10px] gap-[20px]'>

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
        onChange={(e)=>setEmail(e.target.value)}
      />
      <input 
        type="password" 
        placeholder='Enter Your Password' 
        className='border rounded-md outline-none p-2 w-full focus:ring-2 focus:ring-black'
        onChange={(e)=>setPassword(e.target.value)}
      />
    </div>
    <div className='flex flex-col items-center justify-center gap-1'>
        <button className='bg-black text-white px-6 py-2 rounded-lg cursor-pointer' onClick={handleSignIn}>Sign In</button>
        <p>Already registered? <span className='text-blue-600 underline cursor-pointer' onClick={()=>navigate("/signup")}>Sign Up</span></p>
    </div>

  </div>

  </div>
</div>
  )
}

export default Login
