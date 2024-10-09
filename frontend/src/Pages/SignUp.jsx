import React, { useState, useEffect } from 'react'
import './CSS/LoginSignup.css'
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


export const SignUp = () => {
  // State for form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [emailErrorMessage, setEmailErrorMessage] = useState('');
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
  const [count, setCount] = useState(0);
  const [lock, setLock] = useState(false);
  const [lockMessage, setLockMessage] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async(e) => {
    e.preventDefault();
    // Basic validation checks

    const url = '/api/login/';
    const data = {
      email: email,
      password: password
    };

    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-CSRFTOKEN': 'wtZzU2TkoACioBvJdVSAaGNrtzjVDUKORZpRLZJqSajwuRqwKzzR9G2e2OokHVSP'
    };

    if (!email || !password) {
      setErrorMessage('All fields are required.');
      return;
    }
    // if (email !== "o") {
    //   setUsernameErrorMessage('Username not found!');
    //   return;
    // } else setUsernameErrorMessage('');

    if (password !== "Qq@12345" && count < 3) {
        setPasswordErrorMessage('Incorrect Password! Please try again.');
        setCount(count + 1);
        return;
    } else if (count === 3) {
        setPasswordErrorMessage('Your account will be locked after two more attempts.');
        setCount(count + 1);
        return;
    } else if (count === 4) {
        setPasswordErrorMessage('Your account will be locked after one more attempt.');
        setCount(count + 1);
        return;
    } else if (count === 5) {
        setLock(true);
        setLockMessage('Your account has been temporarily locked for 5 mins. Please try again later or ');
        //setCount(0);
        //setLock(false);
        //setErrorMessage('');
        return;
    } else setPasswordErrorMessage('');

    // If validation passes, clear the error message and submit the form

    try {
      const response = await axios.post(url, data, { headers });
      console.log('Success:', response.data);
      document.cookie = `access=${response.data.access}; path=/;`;
      document.cookie = `refresh=${response.data.refresh}; path=/;`;
      window.location.href = '/browse';
    } catch (error) {
      console.error('Error:', error);
    }

    setErrorMessage('');
    if (email && password) {
      navigate('/');
    }
  };

  return (
    <div className='loginsignup'>
      <div className='loginsignup-container'>
        <h1>LOGIN</h1>
        <form onSubmit={handleSubmit}>
          <div className='loginsignup-fields'>
            <input type='email' placeholder='Enter email' value={email} onChange={(e) => setEmail(e.target.value)}/>
            {emailErrorMessage && <p style={{ color: 'red' }}>{emailErrorMessage}</p>}
            <input type='password' placeholder='Password' value={password} onChange={(e) => setPassword(e.target.value)} />
            <div className='error-container'>
                {passwordErrorMessage && !lock && <p style={{ color: 'red' }}>{passwordErrorMessage}</p>}
                {!lock && <Link to='/resetpassword' style={{ textDecoration: 'none' }}><p className="loginsignup-signup">Forget Password?</p></Link>}
                {lockMessage && <p style={{ color: 'red', fontWeight: 'bold', textAlign: 'center' }}>{lockMessage}
                 <Link to='/resetpassword' style={{ textDecoration: 'none' }}><span style={{ fontWeight: 'bold', textDecoration: 'underline', color: 'red'}}>reset your password</span></Link></p>}
            </div>
            {errorMessage && <p style={{color: 'red'}}>{errorMessage}</p>}
          </div>
          <button type='submit'>Log in</button>
        </form>
      </div>
    </div>
  );
}
export default SignUp