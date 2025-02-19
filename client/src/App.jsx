import React from 'react'
import './App.css'
import { Routes, Route, BrowserRouter } from 'react-router-dom'
import Login from './components/Login'
import Home from './pages/Home'
import Register from './components/Register'
import Report from './components/Report'
import Navbar from './components/Navbar'

const App = () => {
  return (
    <BrowserRouter>
      <div>
        <Navbar/>
      <Routes>
        <Route element={<Home/>} path='/'/>
        <Route element={<Login/>} path='/login'/>
        <Route element={<Register/>} path='/register'/>
        <Route element={<Report/>} path='/report'/>
      </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
