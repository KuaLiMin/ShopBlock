import React, { useState } from 'react'
import PhoneInput from 'react-phone-input-2'
import './CSS/LoginSignup.css'
import 'react-phone-input-2/lib/style.css'
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Button, CircularProgress } from '@mui/material';
import axios from 'axios';

export const Login = () => {
  // State for form fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [agree, setAgree] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [usernameErrorMessage, setUsernameErrorMessage] = useState('');
  const [emailErrorMessage, setEmailErrorMessage] = useState('');
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
  const [phoneErrorMessage, setPhoneErrorMessage] = useState('');
  const [contactno, setContactNo] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [loading, setLoading] = useState(false); // Tracks if the login is loading

  // Regular expression for email validation
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const navigate = useNavigate();

  const handlePhoneChange = (e, value, name) => {
    if (name === "contactno") {
      let splitMobile = e?.split(value?.dialCode)
      //console.log("splitMobile===== ", splitMobile?.[1] || "")
      setCountryCode(value?.dialCode)

      // Convert phoneNo to integer
      let phoneNo = parseInt(splitMobile?.[1] || "", 10)
      setPhone(phoneNo)
    }

    setContactNo(value) // set contactNo : value is the dict
  };

  // Function to simulate a delay for the loading animation
  const simulateLoading = (duration) => {
    return new Promise((resolve) => setTimeout(resolve, duration));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Show the loading spinner when login is in progress

    if (!username || !email || !password || !phone) {
      setErrorMessage('All fields are required.');
      return;
    }
    if (username.length < 4) {
      setUsernameErrorMessage('Username must be at least 4 characters long.');
      return;
    } else setUsernameErrorMessage('')

    if (!emailPattern.test(email)) {
      setEmailErrorMessage('Please enter a valid email address.');
      return;
    } else setEmailErrorMessage('')

    if (regex.test(password) === false) {
      setPasswordErrorMessage('Password does not meet the password requirements.');
      return;
    } else setPasswordErrorMessage('');

    if (!agree) {
      setErrorMessage('You must agree to the terms and conditions.');
      return;
    }

    // If validation passes, clear the error message and submit the form
    setErrorMessage('');

    try {
      // Prepare form data
      const formData = new FormData();
      formData.append('email', email);
      formData.append('username', username);
      formData.append('password', password);
      formData.append('phone_number', phone);
      formData.append('biography', 'Hey there! Nice to meet you!');

      // Perform POST request using async/await inside try-catch
      const response = await axios.post('/register/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // If registration is successful, navigate to the signup page
      console.log('Response data:', response.data);
      // setLoading(true);
      // await simulateLoading(2000); // 2 seconds delay
      // setLoading(false);
      navigate('/signup'); // Redirect to signup or another page after successful registration

    } catch (error) {
      // Handle error responses
      console.error('There was an error!', error);
      console.log(error.response.data.error)

      // Check for a 400 error and specific response messages
      if (error.response && error.response.status === 400) {
        // Assuming the backend sends a response with a specific error message
        if (error.response.data.error == 'Email already registered') {
          setEmailErrorMessage('An account with this email already exists.');
        }
        else if (error.response.data.error == 'Phone already registered') {
          setPhoneErrorMessage('An account with this phone number exists!')
        }

      } else {
        // General error message for non-400 status codes
        setErrorMessage('An error occurred during registration.');
      }
    }
  };

  return (
    <div className='loginsignup'>
      <div className='loginsignup-container'>
        <h1>Create Account</h1>
        <form onSubmit={handleSubmit}>
          <div className='loginsignup-fields'>
            <input type='text' placeholder='Enter Username' value={username} onChange={(e) => setUsername(e.target.value)} />
            {usernameErrorMessage && <p style={{ color: 'red', paddingLeft: '10px' }}>{usernameErrorMessage}</p>}
            <input type='email' placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)} />
            {emailErrorMessage && <p style={{ color: 'red', paddingLeft: '10px' }}>{emailErrorMessage}</p>}
            <input type='password' placeholder='Password' value={password} onChange={(e) => setPassword(e.target.value)} />
            {passwordErrorMessage && <p style={{ color: 'red', paddingLeft: '10px' }}>{passwordErrorMessage}</p>}
            <PhoneInput
              country={"sg"}
              value={`${countryCode}${contactno}`}
              onChange={(e, phone) => handlePhoneChange(e, phone, "contactno")}
              inputStyle={{ height: "72px", width: "100%", paddingLeft: "48px", border: "1px solid #c9c9c9", outline: "none", color: "#5c5c5c", fontSize: "18px", borderRadius: "0px" }} />
            {phoneErrorMessage && <p style={{ color: 'red', paddingLeft: '10px' }}>{phoneErrorMessage}</p>}
          </div>
          {errorMessage && <p className='loginsignup-fields' style={{ color: 'red', paddingLeft: '10px' }}>{errorMessage}</p>}
          <Button variant="contained" type="submit" style={{ width: '100%', height: '60px' }}>
            {/* {loading ? <CircularProgress size={24} color="inherit" /> : 'Register'} */}
            Register
          </Button>
          {loading && (
            <div className="loading-overlay">
              <CircularProgress size={60} />
            </div>
          )}
          <div className="loginsignup-agree">
            <input type="checkbox" checked={agree} onChange={() => setAgree(!agree)} />
            <p>By continuing, I agree to the terms of use & privacy policy.</p>
          </div>
        </form>
        {/* Add the login prompt here */}
        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <p className="loginsignup-login">Already have an account? <Link to='/signup' style={{ color: '#ff4141', textDecoration: 'none', fontWeight: 'bold' }}>Login here</Link></p>
        </div>
      </div>
    </div>
  );
}
export default Login