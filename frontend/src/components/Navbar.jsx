import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';
import { serverUrl } from '../App';
import axios from 'axios';
import { setUserData } from '../redux/userSlice';


const Navbar = () => {
    const {userData}=useSelector(state=>state.user);
    const dispatch=useDispatch();
    const navigate=useNavigate()

     let handleLogout=async()=>{
       try {
                  const result=await axios.get(`${serverUrl}/api/auth/logout`,{withCredentials:true})
                    dispatch(setUserData(null));
                    navigate("/");
                    console.log("DISPATCH CALLED");
                 } catch (error) {
                  console.log(error.response?.data?.message || error.message);
                 }
     }
  return (
  <div className='flex justify-between items-center px-5 h-18 bg-gray-500 border-b border-gray-300'>
      <div className='flex max-w-[40%]'>
        <div className='font-bold text-3xl'><span className='text-gray-300'>Git</span><span className='text-gray-700'>Mind</span></div>
      </div>
      <div className='max-w-[60%]'>
            <ul className='hidden md:flex gap-5 text-gray-300 text-[20px]'>
            <NavLink to="/tokens"><li>Tokens</li></NavLink>
            <NavLink to="/dashboard"><li>Dashboard</li></NavLink>
            <li><button onClick={handleLogout} className='cursor-pointer'>Logout</button></li>
           </ul>
         <div className=' gap-3 text-gray-300 text-[20px] md:hidden'>
            <button>click</button>
         </div>
      </div>
    </div>
  )
}

export default Navbar
