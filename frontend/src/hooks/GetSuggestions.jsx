import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import axios from 'axios'
import { serverUrl } from '../App'
import { setSuggestions } from '../redux/refactorSlice'
const GetSuggestions = ({ repoId }) => {
    const dispatch = useDispatch();
    useEffect(() => {
        const fetch = async () => {
            try {
                const result = await axios.get(`${serverUrl}/api/refactor/getSuggestions/${repoId}`, {withCredentials: true});
                dispatch(setSuggestions(result.data.refactor));
            } catch (error) {
                console.log(error);
            }
        }
        fetch();
    }, [repoId])
    return null;
}
export default GetSuggestions;