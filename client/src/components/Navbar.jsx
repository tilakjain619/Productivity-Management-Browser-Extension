import React from 'react'
import './navbar.css'
import { Link } from 'react-router-dom'

const Navbar = () => {
  const user = localStorage.getItem("userId");
  const handleLogout = async () =>{
    localStorage.removeItem("userId");
  }
  return (
    <nav>
        <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/report">Productivity Report</Link></li>
            {/* <li><Link to="/blocked">Blocked Websites</Link></li> */}
            {
              user ? <li><Link onClick={handleLogout}>Logout</Link></li>
              : <li><Link to="/login">Login</Link></li>
            }
        </ul>
    </nav>
  )
}

export default Navbar
