import React from 'react'
import Signup from './pages/Signup'
import { Navigate, Route, Routes} from 'react-router-dom'
import Login from './pages/Login'
import { Loader } from 'lucide-react'
import VerifyEmail from './components/VerifyEmail'
import { useSelector } from 'react-redux'
import Home from './pages/Home'
import GetCurrentUser from './hooks/GetCurrentUser'
import Dashboard from './pages/Dashboard'
import Navbar from './components/Navbar'
import GetRepos from './hooks/GetRepos'

export const serverUrl = "http://localhost:8000"

const App = () => {
  const {userData,loading}=useSelector(state=>state.user);
  return (
    <div>
      <GetCurrentUser/>
       {loading ? (
        <div className='flex items-center justify-center h-screen'>
          <Loader className='size-10 animate-spin'/>
        </div>
      ) : (
        <Routes>
          <Route path='/signup' element={!userData ? <Signup /> : <Navigate to={"/"} />}/>
          <Route path="/verifyEmail" element={!userData ? <VerifyEmail/> : <Navigate to={"/"} />}/>
          <Route path='/login' element={!userData ? <Login/> : <Navigate to={"/"} />}/>
          <Route path='/' element={userData ? <Home/> : <Navigate to={"/login"} />} />
          <Route path='/dashboard' element={userData ? <Dashboard/> : <Navigate to={"/login"} />} />
        </Routes>
      )}
    </div>
  )
}

export default App
