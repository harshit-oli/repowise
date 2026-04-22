import axios from 'axios';
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { serverUrl } from '../App';
import { useState } from 'react';
import { setUserData } from '../redux/userSlice';
import { useDispatch } from 'react-redux';

const Signup = () => {
     const [name,setName]=useState("");
        const [email,setEmail]=useState("");
        const [password,setPassword]=useState("");
        const [loading,setLoading]=useState(false);
    const navigate=useNavigate()
     const dispatch=useDispatch()

    const handleSignUp=async()=>{
    //    setLoading(true);
       try {
        const result=await axios.post(`${serverUrl}/api/auth/register`,{name,email,password},{withCredentials:true})
          console.log(result);
           sessionStorage.setItem("canVerify", "true");
          if (result.data) {
            navigate("/verifyEmail");
          }
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
      <div className='font-bold text-2xl'>Create your account</div>
      <div className='text-gray-500'>Start analyzing repos for free</div>
    </div>
    <div className='flex flex-col items-center justify-center gap-2'>
      <div className='bg-black text-white px-4 py-2 rounded-lg cursor-pointer'>
        Sign Up with Github
      </div>
      <div className='text-gray-400'>or with email</div>
    </div>

    <div className='flex flex-col gap-3 w-full'>
      
      <input 
        type="text" 
        placeholder='Enter Your Name' 
        className='border rounded-md outline-none p-2 w-full'
        id='name'
        onChange={(e)=>setName(e.target.value)}
      />
      <input 
        type="email" 
        placeholder='Enter Your Email' 
        className='border rounded-md outline-none p-2 w-full'
        id='email'
        onChange={(e)=>setEmail(e.target.value)}
      />
      <input 
        type="password" 
        placeholder='Enter Your Password' 
        className='border rounded-md outline-none p-2 w-full'
        id='password'
        onChange={(e)=>setPassword(e.target.value)}
      />
    </div>
    <div className='flex flex-col items-center justify-center gap-1'>
        <button className='bg-black text-white px-6 py-2 rounded-lg cursor-pointer' onClick={handleSignUp}>Sign Up</button>
        <p>Already registered? <span className='text-blue-600 underline cursor-pointer' onClick={()=>navigate("/login")}>Sign In</span></p>
    </div>
  </div>
</div>
   </div>
  )
}
export default Signup
