import React, { useState, useEffect } from 'react'
import './CSS/LoginSignup.css'
import { useNavigate } from 'react-router-dom';
import { Button, CircularProgress } from '@mui/material';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import axios from 'axios';

export const ChangePassword = () => {
  // State for form fields
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [oldPasswordMessage, setOldPasswordMessage] = useState('');
  const [newPasswordMessage, setNewPasswordMessage] = useState('');
  const [confirmPasswordMessage, setConfirmPasswordMessage] = useState('');
  const [profile, setProfile] = useState('');
  const [loading, setLoading] = useState(false); // Tracks if the login is loading
  const [open, setOpen] = useState(false); // State to manage the snackbar visibility
  const [successMessage, setSuccessMessage] = useState('');

  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  const navigate = useNavigate();

  // Utility function to get a specific cookie by name
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }

  // Example usage
  const accessToken = getCookie('access');
  console.log('Access Token:', accessToken);

  // Fetch the user profile data when the component mounts
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('/user', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setProfile(response.data); // Store the profile data in state
        console.log(response.data)
      } catch (error) {
        console.error('Error fetching profile data', error);
      }
    };

    fetchProfile();
  }, []);

  const nextPage = () => {
    navigate('/userprofile');
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!oldPassword || !newPassword || !confirmPassword) {
      setErrorMessage('All fields are required.');
      return;
    }

    // if (oldPassword !== "o") {
    //   setOldPasswordMessage('Password does not match!');
    //   return;
    // } else setOldPasswordMessage('');

    // If the newPassword fails the regex test, print out the following
    if (regex.test(newPassword) === false) {
      setNewPasswordMessage('New password does not meet the password requirements.');
      return;
    } else setNewPasswordMessage('');

    if (confirmPassword !== newPassword) {
      setConfirmPasswordMessage('Please make sure your passwords match.');
      return;
    } else setConfirmPasswordMessage('');

    // If validation passes, clear the error message and submit the form
    setErrorMessage('');
    // Add axios PUT request here
    try {
      setLoading(true); // Show the loading spinner when login is in progress
      const response = await axios.put('/user/', {
        password: oldPassword,
        new_password: newPassword
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,    // Add Bearer token here
          'Content-Type': 'application/json',    // If you're sending JSON data
        },
      });

      console.log(response.data); // Handle the response

      // If the request is successful, clear any loading or error messages
      setSuccessMessage('Your password has been changed!');
      handleOpen();
      setLoading(false);
    } catch (error) {
      console.error(error);
      setErrorMessage('An error occurred while resetting the password.');
      setLoading(false);
    }

    // Create a FormData object
    // const formData = new FormData();
    // formData.append('email', profile.email);
    // formData.append('username', profile.username);
    // formData.append('password', oldPassword); // Current password
    // formData.append('phone_number', profile.phone_number);
    // formData.append('avatar', ""); // Empty string or file object if needed
    // formData.append('biography', profile.biography);
    // formData.append('new_password', newPassword); // New password
  };


  return (
    <div className='loginsignup'>
      <div className='loginsignup-container'>
        <h1>Change Password</h1>
        <form onSubmit={handleSubmit}>
          <div className='loginsignup-fields'>
            <input type='password' placeholder='Enter current password' value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
            {oldPasswordMessage && <p style={{ color: 'red' }}>{oldPasswordMessage}</p>}
            <input type='password' placeholder='Enter new password' value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            {newPasswordMessage && <p style={{ color: 'red' }}>{newPasswordMessage}</p>}
            <input type='password' placeholder='Confirm new password' value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            {confirmPasswordMessage && <p style={{ color: 'red' }}>{confirmPasswordMessage}</p>}
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
          </div>
          <Button variant="contained" type="submit" disabled={loading} style={{ width: '100%', height: '60px' }}>
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Change Password'}
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
        <MuiAlert onClose={handleClose} severity="success" variant="filled" sx={{ width: '100%' }}>
          {successMessage}
        </MuiAlert>
      </Snackbar>
    </div>
  );
}
export default ChangePassword