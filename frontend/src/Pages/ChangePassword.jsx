import React, { useState } from 'react'
import './CSS/LoginSignup.css'
import { Link } from 'react-router-dom';

export const ChangePassword = () => {
  // State for form fields
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [oldPasswordMessage, setOldPasswordMessage] = useState('');
  const [newPasswordMessage, setNewPasswordMessage] = useState('');
  const [confirmPasswordMessage, setConfirmPasswordMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Basic validation checks
    console.log(newPassword)
    console.log(confirmPassword)

    if (!oldPassword || !newPassword || !confirmPassword) {
      setErrorMessage('All fields are required.');
      return;
    }

    if (oldPassword != "oooo") {
        setOldPasswordMessage('Password does not match!');
        return;
    } else setOldPasswordMessage('');

    if (newPassword != "o") {
        setNewPasswordMessage('New password does not match the password requirements.');
        return;
    } else setNewPasswordMessage('');

    if (confirmPassword != newPassword) {
        setConfirmPasswordMessage('Please make sure your passwords match.');
        return;
    } else setConfirmPasswordMessage('');

    // If validation passes, clear the error message and submit the form
    setErrorMessage('');
    alert('Form submitted successfully!');
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
            <input type='password' placeholder='Confirm new password' value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            {confirmPasswordMessage && <p style={{ color: 'red' }}>{confirmPasswordMessage}</p>}
            {errorMessage && <p style={{color: 'red'}}>{errorMessage}</p>}
          </div>
          <button type='submit'>Change Password</button>
        </form>
      </div>
    </div>
  );
}
export default ChangePassword