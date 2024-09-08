import React from 'react';

function LandingPage() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
      <a href="/user/login">
        <button style={{ margin: '10px', padding: '10px 20px' }}>Login</button>
      </a>
      <a href="/user/signup1">
        <button style={{ margin: '10px', padding: '10px 20px' }}>Signup</button>
      </a>
    </div>
  );
}

export default LandingPage;