import axios from 'axios'
import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setRepoData } from '../redux/repoSlice';
import { serverUrl } from '../App';

const GetRepos = () => {
    const dispatch=useDispatch();
 
    useEffect(()=>{

        const fetchRepo=async()=>{
            try {
            const result=await axios.get(`${serverUrl}/api/repo/getRepos`,{withCredentials:true});
            console.log("repo data here",result.data.repos);
            dispatch(setRepoData(result.data.repos))
        } catch (error) {
            console.log("error aa gya");
        }
        }
        fetchRepo();
    },[dispatch])
}

export default GetRepos
