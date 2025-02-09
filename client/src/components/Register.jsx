import React from 'react'
import { Link } from 'react-router-dom'
import './login.css'
const Register = () => {
    return (
        <div className='auth-container'>
            <div className="login-page">
                <div className="form">
                <h2 className="form-title">Register</h2>
                    <form className="register-form">
                        <input type="text" placeholder="Name" />
                        <input type="email" placeholder="Email" />
                        <input type="password" placeholder="Password" />
                        <button>create</button>
                        <p className="message">Already registered? <Link to="/login">Sign In</Link></p>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Register
