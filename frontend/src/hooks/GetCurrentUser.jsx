import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { setLoading, setUserData } from '../redux/userSlice';
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
    finally {
      dispatch(setLoading(false));
    }
    }
    fetchUser();
   },[dispatch]) 

}

export default GetCurrentUser
