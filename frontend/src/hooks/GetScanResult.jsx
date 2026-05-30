import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import axios from 'axios'
import { serverUrl } from '../App'
import { setScanData } from '../redux/securitySlice'

const GetScanResult = ({ repoId }) => {
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchScan = async () => {
            try {
                const result = await axios.get(`${serverUrl}/api/security/scanResult/${repoId}`, {withCredentials: true});
                console.log(result.data.getScan)
                dispatch(setScanData(result.data.getScan));
            } catch (error) {
                console.log(error);
            }
        }
        fetchScan();
    }, [repoId])
}

export default GetScanResult;