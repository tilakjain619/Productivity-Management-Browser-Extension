import React from 'react'
import './App.css'
import { Routes, Route, BrowserRouter } from 'react-router-dom'
import Login from './components/Login'
import Home from './pages/Home'
import Register from './components/Register'
import Report from './components/Report'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Home/>} path='/'/>
        <Route element={<Login/>} path='/login'/>
        <Route element={<Register/>} path='/register'/>
        <Route element={<Report/>} path='/report'/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
