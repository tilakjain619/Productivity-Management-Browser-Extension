import React from 'react'
import '../components/report.css'
import { Link } from 'react-router-dom'

const Home = () => {
  return (
    <div className='main-container'>
      <div className='home-container'>
        <h2>Productivity Management Extension</h2>
        <p>A browser extension and website that helps users manage tasks, track time, block distracting websites, and generate productivity reports, all at one place.</p>
        <Link className='home-cto' to="/register">Get Started</Link>
      </div>
    </div>
  )
}

export default Home
