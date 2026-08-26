import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';
import { serverUrl } from '../App';
import axios from 'axios';
import { setUserData } from '../redux/userSlice';
import { useState } from 'react'


const Navbar = () => {
    const {userData}=useSelector(state=>state.user);
    const dispatch=useDispatch();
    const navigate=useNavigate()
    const [menuOpen, setMenuOpen] = useState(false)

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
  <div className='flex justify-between items-center px-5 h-18 bg-gray-500 border-b border-gray-300 sticky top-0 z-50'>
      <div className='flex max-w-[40%]'>
        <div className='font-bold text-3xl'><span className='text-gray-300'>Git</span><span className='text-gray-700'>Mind</span></div>
      </div>
      <div className='max-w-[60%]'>
            <ul className='hidden md:flex gap-5 text-gray-300 text-[20px]'>
            <NavLink to="/dashboard"><li>Dashboard</li></NavLink>
            <li><button onClick={handleLogout} className='cursor-pointer'>Logout</button></li>
           </ul>
         <div className='md:hidden relative'>
    <button onClick={() => setMenuOpen(!menuOpen)} className='text-gray-300 text-2xl'>
        ☰
    </button>
    
    {menuOpen && (
        <div className='absolute right-0 top-10 bg-gray-700 rounded-xl p-3 flex flex-col gap-2 w-40 z-50'>
            <NavLink to="/dashboard" onClick={() => setMenuOpen(false)}>
                <div className='text-gray-300 text-base px-3 py-2 hover:bg-gray-600 rounded-lg'>
                    Dashboard
                </div>
            </NavLink>
            <button 
                onClick={() => { handleLogout(); setMenuOpen(false) }}
                className='text-gray-300 text-base px-3 py-2 hover:bg-gray-600 rounded-lg text-left cursor-pointer'
            >
                Logout
            </button>
        </div>
       )}
     </div>
      </div>
    </div>
  )
}

export default Navbar
