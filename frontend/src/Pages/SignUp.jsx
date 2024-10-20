import React, { useState, useEffect } from 'react'
import './CSS/LoginSignup.css'
import { Link } from 'react-router-dom';
import { Button, CircularProgress } from '@mui/material';
import axios from 'axios';


export const SignUp = () => {
  // State for form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [emailErrorMessage, setEmailErrorMessage] = useState('');
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
  const [count, setCount] = useState(0); // Tracks failed login attempts
  const [lock, setLock] = useState(false); // Tracks whether the account is locked
  const [lockMessage, setLockMessage] = useState(''); // Stores lock message
  const [unlockTime, setUnlockTime] = useState(null); // Tracks the unlock time
  const [loading, setLoading] = useState(false); // Tracks if the login is loading

  useEffect(() => {
    // If the account is locked, set a timer for 5 minutes
    if (lock) {
      const unlockDate = new Date();
      unlockDate.setMinutes(unlockDate.getMinutes() + 5);
      setUnlockTime(unlockDate);

      // Set a timer to unlock the account after 5 minutes
      const timer = setTimeout(() => {
        setLock(false); // Unlock the account
        setCount(0); // Reset the login attempt counter
        setLockMessage(''); // Clear lock message
      }, 5 * 60 * 1000); // 5 minutes in milliseconds

      // Clean up the timer when the component unmounts or if the lock state changes
      return () => clearTimeout(timer);
    }
  }, [lock]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Show the loading spinner when login is in progress

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

    try {
      const response = await axios.post(url, data, { headers });

      // Check if the response status is OK (2xx)
      if (response.status === 200) {
        console.log('Success:', response.data);

        // Set cookies with access and refresh tokens
        document.cookie = `access=${response.data.access}; path=/;`;
        document.cookie = `refresh=${response.data.refresh}; path=/;`;

        // Redirect to the listing page
        window.location.href = '/';
      } else {
        // If status code is not 200, throw an error
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      // Handle error and show a message to the user
      console.error('Error:', error);
      if (count < 3) {
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

      // Display an error message (you can customize this to show in the UI)
      //alert('Login failed. Please check your email and password and try again.');
    } finally {
      setLoading(false); // Hide the loading spinner after the request completes
    }

    setErrorMessage('');
  };

  return (
    <div className='loginsignup'>
      <div className='loginsignup-container'>
        <h1>LOGIN</h1>
        <form onSubmit={handleSubmit}>
          <div className='loginsignup-fields'>
            <input type='email' placeholder='Enter email' value={email} onChange={(e) => setEmail(e.target.value)} />
            {emailErrorMessage && <p style={{ color: 'red' }}>{emailErrorMessage}</p>}
            <input type='password' placeholder='Password' value={password} onChange={(e) => setPassword(e.target.value)} />
            <div className='error-container'>
              {passwordErrorMessage && !lock && <p style={{ color: 'red' }}>{passwordErrorMessage}</p>}
              {!lock && <Link to='/resetpassword' style={{ textDecoration: 'none' }}><p className="loginsignup-signup">Forget Password?</p></Link>}
              {lockMessage && <p style={{ color: 'red', fontWeight: 'bold', textAlign: 'center' }}>{lockMessage}
                <Link to='/resetpassword' style={{ textDecoration: 'none' }}><span style={{ fontWeight: 'bold', textDecoration: 'underline', color: 'red' }}>reset your password</span></Link></p>}
              {/* Show unlock time */}
              <br></br>
              {unlockTime && lock && (
                <p style={{ color: 'red', fontWeight: 'bold', textAlign: 'center' }}>Account will unlock at: {unlockTime.toLocaleTimeString()}</p>
              )}
            </div>
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
          </div>
          <Button variant="contained" type="submit" disabled={loading} style={{ width: '100%', height: '60px' }}>
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Log in'}
          </Button>
          {/* Add the signup prompt here */}
          <div style={{ marginTop: '16px', textAlign: 'center' }}>
            <p className='loginsignup-login'>Don't have an account? <Link to='/login' style={{ color: '#007BFF', textDecoration: 'none', fontWeight: 'bold' }}>Create a ShopBlock account</Link></p>
          </div>
        </form>
      </div>
    </div>
  );
}
export default SignUp