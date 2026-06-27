import axios from 'axios'
import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setRepoData } from '../redux/repoSlice';
import { serverUrl } from '../App';
import { setAnalysisData } from '../redux/analysis';

const GetAnalysis = ({repoId}) => {
    const dispatch=useDispatch();
 
    useEffect(()=>{
        const fetchAnalysis=async()=>{
            try {
            const result=await axios.get(`${serverUrl}/api/Analysis/getAnalysis/${repoId}`,{withCredentials:true});
            console.log("Analysis data here",result.data.analysis);
            dispatch(setAnalysisData(result.data.analysis))
        } catch (error) {
            console.log("error aa gya",error);
        }
        }
        fetchAnalysis();
    },[dispatch])
}

export default GetAnalysis
