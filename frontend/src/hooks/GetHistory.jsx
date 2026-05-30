import axios from 'axios'
import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { serverUrl } from '../App';
import { setHistoryData } from '../redux/commitSlice';

const GetHistory = ({repoHistoryId}) => {
    const dispatch=useDispatch();
 
    useEffect(()=>{

        const fetchRepo=async()=>{
            try {
            const result=await axios.get(`${serverUrl}/api/commits/getHistory/${repoHistoryId}`,{withCredentials:true});
            console.log("history data here",result.data.history);
            dispatch(setHistoryData(result.data.history))
        } catch (error) {
            console.log("error aa gya",error);
        }
        }
        fetchRepo();
    },[dispatch])
}

export default GetHistory