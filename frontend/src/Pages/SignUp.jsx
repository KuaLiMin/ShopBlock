import React, { useState, useEffect } from 'react'
import './CSS/LoginSignup.css'
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export const SignUp = () => {
  // State for form fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [usernameErrorMessage, setUsernameErrorMessage] = useState('');
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
  const [count, setCount] = useState(0);
  const [lock, setLock] = useState(false);
  const [lockMessage, setLockMessage] = useState('');

  const navigate = useNavigate();

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   // Basic validation checks

  //   if (!username || !password) {
  //     setErrorMessage('All fields are required.');
  //     return;
  //   }
  //   if (username !== "o") {
  //     setUsernameErrorMessage('Username not found!');
  //     return;
  //   } else setUsernameErrorMessage('');

  //   if (password !== "o" && count < 3) {
  //       setPasswordErrorMessage('Incorrect Password! Please try again.');
  //       setCount(count + 1);
  //       return;
  //   } else if (count === 3) {
  //       setPasswordErrorMessage('Your account will be locked after two more attempts.');
  //       setCount(count + 1);
  //       return;
  //   } else if (count === 4) {
  //       setPasswordErrorMessage('Your account will be locked after one more attempt.');
  //       setCount(count + 1);
  //       return;
  //   } else if (count === 5) {
  //       setLock(true);
  //       setLockMessage('Your account has been temporarily locked for 5 mins. Please try again later or ');
  //       //setCount(0);
  //       //setLock(false);
  //       //setErrorMessage('');
  //       return;
  //   } else setPasswordErrorMessage('');

  //   // If validation passes, clear the error message and submit the form

  //   setErrorMessage('');
  //   if (username && password) {
  //     navigate('/');
  //   }
  // };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);  // Clear any previous error

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

    try {
      const response = await axios.post(url, data, { headers });
      console.log('Success:', response.data);
      document.cookie = access=${response.data.access}; path=/;;
      document.cookie = refresh=${response.data.refresh}; path=/;;
      window.location.href = '/browse';
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setError('Invalid email or password');
      } else {
        setError('An error occurred. Please try again.');
      }
      console.error('Error:', error);
    }
  };

  
  return (
    <div className='loginsignup'>
      <div className='loginsignup-container'>
        <h1>LOGIN</h1>
        <form onSubmit={handleSubmit}>
          <div className='loginsignup-fields'>
            <input type='text' placeholder='Enter Username' value={username} onChange={(e) => setUsername(e.target.value)}/>
            {usernameErrorMessage && <p style={{ color: 'red' }}>{usernameErrorMessage}</p>}
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