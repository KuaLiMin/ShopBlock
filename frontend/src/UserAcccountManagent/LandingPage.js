import React from 'react';
import './UserAccountManagment.css';

function LandingPage() {
  return (
    
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
      <a href="/user/login">
        <button className="button">Login</button>
      </a>
      <a href="/user/signup">
        <button className="button">Signup</button>
      </a>
    </div>
  );
}

export default LandingPage;