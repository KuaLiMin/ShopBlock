import React, { useState } from 'react'
import PhoneInput from 'react-phone-input-2'
import './CSS/LoginSignup.css'
import 'react-phone-input-2/lib/style.css'
import { Link } from 'react-router-dom';

export const Login = () => {
  // State for form fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [agree, setAgree] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [usernameErrorMessage, setUsernameErrorMessage] = useState('');
  const [contactno, setContactNo] = useState('');
  const [countryCode, setCountryCode] = useState('');

  // Regular expression for email validation
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handlePhoneChange = (e, value, name) => {
    if (name === "contactno") {
      let splitMobile = e?.split(value?.dialCode)
      //console.log("splitMobile===== ", splitMobile?.[1] || "")
      setCountryCode(value?.dialCode)
      setPhone(splitMobile?.[1] || "")
    }

    setContactNo(value) // set contactNo : value is the dict
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Basic validation checks
    if (!username || !email || !password || !phone) {
      setErrorMessage('All fields are required.');
      return;
    }
    if (username.length < 4) {
      setUsernameErrorMessage('Username must be at least 4 characters long.');
      return;
    } else setUsernameErrorMessage("")

    if (!emailPattern.test(email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!agree) {
      setErrorMessage('You must agree to the terms and conditions.');
      return;
    }

    // If validation passes, clear the error message and submit the form
    setErrorMessage('');
    alert('Form submitted successfully!');
    console.log(username)
    console.log(email)
    console.log(password)
    console.log(phone)
  };

  
  return (
    <div className='loginsignup'>
      <div className='loginsignup-container'>
        <h1>Create Account</h1>
        <form onSubmit={handleSubmit}>
          <div className='loginsignup-fields'>
            <input type='text' placeholder='Enter Username' value={username} onChange={(e) => setUsername(e.target.value)} required/>
            {usernameErrorMessage && <p style={{ color: 'red' }}>{usernameErrorMessage}</p>}
            <input type='email' placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type='password' placeholder='Password' value={password} onChange={(e) => setPassword(e.target.value)} />
            <PhoneInput 
              country={"sg"}
              value={`${countryCode}${contactno}`}
              onChange={(e, phone) => handlePhoneChange(e, phone, "contactno")}
              inputStyle={{height: "72px", width: "100%", paddingLeft: "48px", border: "1px solid #c9c9c9", outline: "none", color: "#5c5c5c", fontSize: "18px", borderRadius: "0px" }} />
          </div>
          {errorMessage && <p style={{color: 'red'}}>{errorMessage}</p>}
          <button type='submit'>Register</button>
          <div className="loginsignup-agree">
            <input type="checkbox" checked={agree} onChange={() => setAgree(!agree)} />
            <p>By continuing, I agree to the terms of use & privacy policy.</p>
          </div>
        </form>
        <p className="loginsignup-login">Already have an account? <Link to='/signup' style={{ textDecoration: 'none' }}><span>Login here</span></Link></p>
      </div>
    </div>
  );
}
export default Login