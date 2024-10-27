import React, { useState } from 'react'
import './CSS/LoginSignup.css'
import { useNavigate } from 'react-router-dom';
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import { Button, CircularProgress } from '@mui/material';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import axios from 'axios';

export const ResetPassword = () => {
  // State for form fields
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [emailErrorMessage, setEmailErrorMessage] = useState('');
  const [phoneErrorMessage, setPhoneErrorMessage] = useState('');
  const [contactno, setContactNo] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordMessage, setNewPasswordMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false); // Tracks if the login is loading
  const [open, setOpen] = useState(false); // State to manage the snackbar visibility

  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  const navigate = useNavigate();

  const nextPage = () => {
    navigate('/signup');
  }

  // Function to handle opening the snackbar
  const handleOpen = () => {
    setOpen(true);
  };

  // Function to handle closing the snackbar
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
    nextPage();
  };

  const handlePhoneChange = (e, value, name) => {
    if (name === "contactno") {
      let splitMobile = e?.split(value?.dialCode)
      setCountryCode(value?.dialCode)

      // Convert phoneNo to integer
      let phoneNo = parseInt(splitMobile?.[1] || "", 10)
      setPhone(phoneNo)
    }

    setContactNo(value) // set contactNo : value is the dict
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !phone || !newPassword) {
      setErrorMessage('All fields are required.');
      return;
    }

    // if (email !== "o@gmail.com") {
    //   setEmailErrorMessage('Email not found!');
    //   return;
    // } else setEmailErrorMessage('');

    // if (phone !== 99999999) {
    //   setPhoneErrorMessage('Phone number does not match!');
    //   return;
    // } else setPhoneErrorMessage('');

    if (regex.test(newPassword) === false) {
      setNewPasswordMessage('New password does not match the password requirements.');
      return;
    } else setNewPasswordMessage('');

    // If validation passes, clear the error message and submit the form
    setErrorMessage('');
    // Add axios PUT request here
    try {
      setLoading(true); // Show the loading spinner when login is in progress
      console.log(phone)
      const response = await axios.put('/reset-password/', {
        email: email,
        phone_number: phone,  // Assuming phone should be sent as a string
        new_password: newPassword
      });

      console.log(response.data); // Handle the response

      // If the request is successful, clear any loading or error messages
      setSuccessMessage('Password reset successfully!');
      handleOpen();
      setLoading(false);
    } catch (error) {
      if (error.response.data.non_field_errors == 'Both email and phone number not found') {
        setErrorMessage('Both email and phone number not found!');
      } else setErrorMessage('')

      if (error.response.data.non_field_errors == 'Email not found') {
        setEmailErrorMessage('Email not found!');
      } else setEmailErrorMessage('')

      if (error.response.data.non_field_errors == 'Phone number not found') {
        setPhoneErrorMessage('Phone number not found!');
      } else setPhoneErrorMessage('')

      setLoading(false);
    }
  };


  return (
    <div className='loginsignup'>
      <div className='loginsignup-container'>
        <h1>Reset Password</h1>
        <form onSubmit={handleSubmit}>
          <div className='loginsignup-fields'>
            <input type='email' placeholder='Enter email' value={email} onChange={(e) => setEmail(e.target.value)} />
            {emailErrorMessage && <p style={{ color: 'red' }}>{emailErrorMessage}</p>}
            <PhoneInput
              country={"sg"}
              value={`${countryCode}${contactno}`}
              onChange={(e, phone) => handlePhoneChange(e, phone, "contactno")}
              inputStyle={{ height: "72px", width: "100%", paddingLeft: "48px", border: "1px solid #c9c9c9", outline: "none", color: "#5c5c5c", fontSize: "18px", borderRadius: "0px" }} />
            {phoneErrorMessage && <p style={{ color: 'red' }}>{phoneErrorMessage}</p>}
            <input type='password' placeholder='Password' value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            {newPasswordMessage && <p style={{ color: 'red' }}>{newPasswordMessage}</p>}
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
          </div>
          <Button variant="contained" type="submit" disabled={loading} style={{ width: '100%', height: '60px' }}>
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
          </Button>
        </form>
      </div>
      {/* Snackbar with MuiAlert for success notification */}
      <Snackbar
        open={open}
        autoHideDuration={2500} // Duration the notification stays open (6 seconds)
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }} // Position at top-right
      >
        <MuiAlert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </MuiAlert>
      </Snackbar>
    </div>
  );
}
export default ResetPassword