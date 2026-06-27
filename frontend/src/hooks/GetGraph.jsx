import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import axios from 'axios'
import { serverUrl } from '../App'
import { setGraphData } from '../redux/graphSlice'

const GetGraph = ({ repoId,refresh  }) => {
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchGraph = async () => {
            try {
                const result = await axios.get(`${serverUrl}/api/dependency/getGraph/${repoId}`, {withCredentials: true});
                dispatch(setGraphData(result.data.graph));
            } catch (error) {
                console.log(error);
            }
        }
        fetchGraph();
    }, [repoId,refresh])

    return null;
}

export default GetGraph;