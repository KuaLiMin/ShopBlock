import React, { useState } from 'react'
import PhoneInput from 'react-phone-input-2'
import './CSS/LoginSignup.css'
import 'react-phone-input-2/lib/style.css'
import './CSS/Modal.css'
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
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
  const [contactno, setContactNo] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [loading, setLoading] = useState(false); // Tracks if the login is loading
  const formData = new FormData();

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
    } else setUsernameErrorMessage("")

    if (!emailPattern.test(email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

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
    // Append form fields to FormData
    formData.append('email', email);
    formData.append('username', username);
    formData.append('password', password);
    formData.append('phone_number', phone);

    // POST request
    // try {
    //   const response = await axios.post('/register/', formData, {
    //     headers: {
    //       'Content-Type': 'multipart/form-data'
    //     }
    //   });

    //   console.log("START");
    //   if (response.status === 200) {
    //     console.log('Response data:', response.data); // Handle success
    //     // Navigate to the signup page
    //     console.log("INSIDE");
    //     navigate('/signup');
    //   } else {
    //     console.log("Unexpected status code:", response.status);
    //   }
    // } catch (error) {
    //   console.error('There was an error!', error); // Handle error
    // } finally {
    //   setLoading(false); // Hide the loading spinner after the request completes
    //   console.log("END");
    // }

    // POST request method here
    axios.post('/register/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
      .then(response => {
        console.log('Response data:', response.data); // Handle success
        // Call toggleModal function here
        navigate('/signup');
      })
      .catch(error => {
        console.error('There was an error!', error); // Handle error
      })
      // .finally(() => {
      //   setLoading(false); // Hide loading spinner when done
      // });

  };


  return (
    <div className='loginsignup'>
      <div className='loginsignup-container'>
        <h1>Create Account</h1>
        <form onSubmit={handleSubmit}>
          <div className='loginsignup-fields'>
            <input type='text' placeholder='Enter Username' value={username} onChange={(e) => setUsername(e.target.value)} />
            {usernameErrorMessage && <p style={{ color: 'red' }}>{usernameErrorMessage}</p>}
            <input type='email' placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type='password' placeholder='Password' value={password} onChange={(e) => setPassword(e.target.value)} />
            {passwordErrorMessage && <p style={{ color: 'red' }}>{passwordErrorMessage}</p>}
            <PhoneInput
              country={"sg"}
              value={`${countryCode}${contactno}`}
              onChange={(e, phone) => handlePhoneChange(e, phone, "contactno")}
              inputStyle={{ height: "72px", width: "100%", paddingLeft: "48px", border: "1px solid #c9c9c9", outline: "none", color: "#5c5c5c", fontSize: "18px", borderRadius: "0px" }} />
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
          </div>
          <Button variant="contained" type="submit" disabled={loading} style={{ width: '100%', height: '50px' }}>
            {/* {loading ? <CircularProgress size={24} color="inherit" /> : 'Register'} */}
            Register
          </Button>
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