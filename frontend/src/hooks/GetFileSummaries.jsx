import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import axios from 'axios'
import { serverUrl } from '../App'
import { setFilesData } from '../redux/fileSlice'

const GetFileSummaries = ({ repoId,refresh }) => {
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchFiles = async () => {
            try {
                const result = await axios.get(`${serverUrl}/api/file/getFileSummaries/${repoId}`, {withCredentials: true});
                console.log("all files here",result.data.files);
                dispatch(setFilesData(result.data.files));
            } catch (error) {
                console.log(error);
            }
        }
        fetchFiles();
    }, [repoId,refresh])
}

export default GetFileSummaries;