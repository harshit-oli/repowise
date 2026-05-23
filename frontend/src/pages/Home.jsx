import React from 'react'
import Navbar from "../components/Navbar"
import Main from '../components/Main'

const Home = () => {
  return (
    <div className='bg-gray-800 max-w-[100vw] pb-10'>
      <Navbar/>
      <Main/>
    </div>
  )
}

export default Home
