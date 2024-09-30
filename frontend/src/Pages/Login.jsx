import React, { useState } from 'react'
import './CSS/LoginSignup.css'

export const Login = () => {
  // State for form fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+65'); // Default country code for Singapore
  const [agree, setAgree] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Regular expression for email validation
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Restrict phone input to numbers only
  const handlePhoneChange = (e) => {
    const value = e.target.value;
    const numericValue = value.replace(/\D/g, ''); // Remove non-numeric characters
    setPhone(numericValue);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Basic validation checks
    if (!username || !email || !password || !phone) {
      setErrorMessage('All fields are required.');
      return;
    }
    if (username.length < 4) {
      setErrorMessage('Username must be at least 4 characters long.');
      return;
    }
    if (!emailPattern.test(email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!agree) {
      setErrorMessage('You must agree to the terms and conditions.');
      return;
    }
    // Complete phone number (country code + phone)
    const fullPhoneNumber = `${countryCode}${phone}`;
    // If validation passes, clear the error message and submit the form
    setErrorMessage('');
    alert('Form submitted successfully!');
  };

  
  return (
    <div className='loginsignup'>
      <div className='loginsignup-container'>
        <h1>Create Account</h1>
        <form onSubmit={handleSubmit}>
          <div className='loginsignup-fields'>
            <input type='text' placeholder='Enter Username' value={username} onChange={(e) => setUsername(e.target.value)} required/>
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
            <input type='email' placeholder='Email' value={email} onChange={(e)=>setEmail(e.target.value)} />
            <input type='password' placeholder='Password' value={password} onChange={(e)=>setPassword(e.target.value)} />
            {/* Country Code Dropdown + Phone Number Field */}
            <div className="phone-field">
              <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)}>
                <option value="+65">+65 (SG)</option> {/* Singapore */}
                <option value="+1">+1 (US)</option>  {/* United States */}
                <option value="+44">+44 (UK)</option> {/* United Kingdom */}
                <option value="+91">+91 (IN)</option> {/* India */}
                {/* Add more country codes as needed */}
              </select>
              <input type='tel' placeholder='Phone Number' value={phone} onChange={handlePhoneChange} />
            </div>
          </div>
          {errorMessage && <p style={{color: 'red'}}>{errorMessage}</p>}
          <button type='submit'>Register</button>
          <div className="loginsignup-agree">
            <input type="checkbox" checked={agree} onChange={() => setAgree(!agree)} />
            <p>By continuing, I agree to the terms of use & privacy policy.</p>
          </div>
        </form>
        <p className="loginsignup-login">Already have an account? <span>Login here</span></p>
      </div>
    </div>
  );
}
export default Login