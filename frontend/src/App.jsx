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
import Repo from './pages/Repo'
import RepoPage from './components/RepoPage'
import FileIssue from './components/FileIssue'
import AddRepo from './components/AddRepo'
import FilePage from './components/FilePage'
import CommitAnalysisPage from './components/CommitAnalysisPage'
import Team from './pages/Team'

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
          <Route path='/repos' element={userData ? <Repo/> : <Navigate to={"/login"} />} />
          <Route path='/team' element={userData ? <Team/> : <Navigate to={"/login"} />} />
          <Route path='/repos/:repoId' element={userData ? <RepoPage/> : <Navigate to={"/login"} />} />
          <Route path='/issueFile/:repoId/:fileName' element={userData ? <FileIssue/> : <Navigate to={"/login"} />} />
          <Route path='/addRepo' element={userData ? <AddRepo/> : <Navigate to={"/login"} />} />
          <Route path='/repos/:repoId/file/:fileId' element={userData ? <FilePage/> : <Navigate to={"/login"} />} />
          <Route path='/repos/:repoId/commit/:sha' element={userData ? <CommitAnalysisPage/> : <Navigate to={"/login"} />} />
        </Routes>
      )}
    </div>
  )
}

export default App
