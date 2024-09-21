import React from 'react'
import './CSS/LoginSignup.css'

export const Login = () => {
  return (
    <div className='loginsignup'>
      <div className='loginsignup-container'>
        <h1>Create Account</h1>
        <div className='loginsignup-fields'>
          <input type='text' placeholder='Enters Username' />
          <input type='password' placeholder='Password' />
          <input type='tel' placeholder='Phone Number' />
        </div>
        <button>Register</button>
        <div className="loginsignup-agree">
          <input type="checkbox" name='' id='' />
          <p>By continuing, I agree to the terms of use & privacy policy.</p>
        </div>
        <p className="loginsignup-login">Already have an account? <span>Login here</span></p>
      </div>
    </div>
  )
}
export default Login