import React, { useState } from "react";
import { TextField, Button, Typography, Container, Paper } from "@mui/material";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);  // Clear any previous error

    const url = '/api/login/';
    const data = {
      email: email,
      password: password
    };
    
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-CSRFTOKEN': 'wtZzU2TkoACioBvJdVSAaGNrtzjVDUKORZpRLZJqSajwuRqwKzzR9G2e2OokHVSP'
    };

    try {
      const response = await axios.post(url, data, { headers });
      console.log('Success:', response.data);
      document.cookie = `access=${response.data.access}; path=/;`;
      document.cookie = `refresh=${response.data.refresh}; path=/;`;
      window.location.href = '/browse';
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setError('Invalid email or password');
      } else {
        setError('An error occurred. Please try again.');
      }
      console.error('Error:', error);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} style={{ padding: '16px' }}>
        <Typography variant="h5" component="h1" align="center">
          Login
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            variant="outlined"
            margin="normal"
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            variant="outlined"
            margin="normal"
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            style={{ marginTop: '16px' }}
          >
            Login
          </Button>
          {error && (
            <Typography color="error" align="center" style={{ marginTop: '16px' }}>
              {error}
            </Typography>
          )}
        </form>
      </Paper>
    </Container>
  );
};

export default Login;
