import React, { useState } from 'react'
import './CSS/LoginSignup.css'
import { Link } from 'react-router-dom';
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'

export const ResetPassword = () => {
  // State for form fields
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [usernameErrorMessage, setUsernameErrorMessage] = useState('');
  const [phoneErrorMessage, setPhoneErrorMessage] = useState('');
  const [contactno, setContactNo] = useState('');
  const [countryCode, setCountryCode] = useState('');


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

  const handleSubmit = (e) => {
    e.preventDefault();
    // Basic validation checks
    console.log(username)
    console.log(phone)

    if (!username || !phone) {
      setErrorMessage('All fields are required.');
      return;
    }

    if (username != "oooo") {
      setUsernameErrorMessage('Username not found!');
      return;
    } else setUsernameErrorMessage('');

    if (phone != 99999999) {
        setPhoneErrorMessage('Phone number does not match!');
        return;
    } else setPhoneErrorMessage('');

    // If validation passes, clear the error message and submit the form
    setErrorMessage('');
    alert('Form submitted successfully!');
  };

  
  return (
    <div className='loginsignup'>
      <div className='loginsignup-container'>
        <h1>Reset Password</h1>
        <form onSubmit={handleSubmit}>
          <div className='loginsignup-fields'>
            <input type='text' placeholder='Enter Username' value={username} onChange={(e) => setUsername(e.target.value)} required/>
            {usernameErrorMessage && <p style={{ color: 'red' }}>{usernameErrorMessage}</p>}
            <PhoneInput 
              country={"sg"}
              value={`${countryCode}${contactno}`}
              onChange={(e, phone) => handlePhoneChange(e, phone, "contactno")}
              inputStyle={{height: "72px", width: "100%", paddingLeft: "48px", border: "1px solid #c9c9c9", outline: "none", color: "#5c5c5c", fontSize: "18px", borderRadius: "0px" }} />
              {errorMessage && <p style={{color: 'red'}}>{errorMessage}</p>}
              {phoneErrorMessage && <p style={{ color: 'red' }}>{phoneErrorMessage}</p>}
          </div>
          <Link to='/changepassword' style={{ textDecoration: 'none' }}><button type='submit'>Reset Password</button></Link>
        </form>
      </div>
    </div>
  );
}
export default ResetPassword