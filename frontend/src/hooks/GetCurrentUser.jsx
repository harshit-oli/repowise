import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setUserData } from '../redux/userSlice';
import axios from 'axios';
import { serverUrl } from '../App';

const GetCurrentUser = () => {
    const dispatch=useDispatch();
   useEffect(()=>{
    const fetchUser=async()=>{
    try {
        const result=await axios.get(`${serverUrl}/api/auth/getProfile`,{withCredentials:true})
        dispatch(setUserData(result.data.user));
    } catch (error) {
      console.log(error);
    }
    }
    fetchUser();
   },[])

}

export default GetCurrentUser
