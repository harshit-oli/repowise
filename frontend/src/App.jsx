import React from 'react'
import Signup from './pages/Signup'
import { Navigate, Route, Routes} from 'react-router-dom'
import Login from './pages/Login'
import VerifyEmail from './components/VerifyEmail'
import { useSelector } from 'react-redux'
import Home from './pages/Home'

export const serverUrl = "http://localhost:8000"
const App = () => {
  const {userData}=useSelector(state=>state.user);
  return (
    <div>
      <Routes>
         <Route path='/signup' element={!userData ? <Signup /> : <Navigate to={"/"} />}/>
         <Route path="/verifyEmail" element={!userData ? <VerifyEmail/> : <Navigate to={"/"} />}></Route>
         <Route path='/login' element={!userData ? <Login/> : <Navigate to={"/"} />}/>
          <Route path='/' element={userData ? <Home/> : <Navigate to={"/login"} />} />
      </Routes>
    </div>
  )
}

export default App
