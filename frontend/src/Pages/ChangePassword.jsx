import React, { useState } from 'react'
import './CSS/LoginSignup.css'
import './CSS/Modal.css'
import { useNavigate } from 'react-router-dom';

export const ChangePassword = () => {
  // State for form fields
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [oldPasswordMessage, setOldPasswordMessage] = useState('');
  const [newPasswordMessage, setNewPasswordMessage] = useState('');
  const [confirmPasswordMessage, setConfirmPasswordMessage] = useState('');
  const [modal, setModal] = useState(false);

  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  const navigate = useNavigate();

  const toggleModal = () => {
    setModal(!modal)
  }

  const nextPage = () => {
    navigate('/');
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    // Basic validation checks
    console.log("over here ==== ", regex.test(newPassword))
    console.log(confirmPassword)

    if (!oldPassword || !newPassword || !confirmPassword) {
      setErrorMessage('All fields are required.');
      return;
    }

    if (oldPassword !== "o") {
        setOldPasswordMessage('Password does not match!');
        return;
    } else setOldPasswordMessage('');

    // If the newPassword fails the regex test, print out the following
    if (regex.test(newPassword) ===  false) {
        setNewPasswordMessage('New password does not meet the password requirements.');
        return;
    } else setNewPasswordMessage('');

    if (confirmPassword !== newPassword) {
        setConfirmPasswordMessage('Please make sure your passwords match.');
        return;
    } else setConfirmPasswordMessage('');

    // If validation passes, clear the error message and submit the form
    setErrorMessage('');

    // Call toggleModal function here
    toggleModal();
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
            {errorMessage && <p style={{color: 'red'}}>{errorMessage}</p>}
          </div>
          <button type='submit'>Change Password</button>
        </form>
      </div>
      {modal && (
      <div className="modal">
        <div className="overlay" onClick={nextPage}>
          <div className="modal-content">
            <h2>Password Change</h2>
            <p>
              Your password has been changed.
            </p>
            <button className='close-modal' onClick={nextPage}>CLOSE</button>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
export default ChangePassword