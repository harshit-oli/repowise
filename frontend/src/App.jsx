import React from 'react'
import Signup from './pages/Signup'
import { Route, Routes } from 'react-router-dom'
import Login from './pages/Login'

export const serverUrl = "http://localhost:8000"
const App = () => {
  return (
    <div>
      <Routes>
         <Route path='/signup' element={<Signup/>}/>
         <Route path='/login' element={<Login/>}/>
      </Routes>
    </div>
  )
}

export default App
