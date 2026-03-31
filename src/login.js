import React, { useState } from 'react';
import { Alert, Box, Button, Container, Paper, Snackbar, TextField, Typography } from '@mui/material';

function Login({ onSwitchToRegister, onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const canSubmit = username.trim().length > 0 && password.length > 0;

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitted(true);

    if (!canSubmit) {
      return;
    }

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('Login successful');
        if (onLoginSuccess) {
          onLoginSuccess(data.user || { username, name: data.name || '', email: data.email || '', dob: data.dob || '' });
        }
      } else {
        const errorMessage = data.message || 'Invalid username or password.';
        console.error('Login failed', errorMessage);
        setSnackbar({ open: true, message: `Login failed: ${errorMessage}`, severity: 'error' });
        // Clear the fields on invalid credential
        setUsername('');
        setPassword('');
        setSubmitted(false);
      }
    } catch (error) {
      console.error('Network error during login', error);
      setSnackbar({ open: true, message: 'Network error: could not reach authentication server.', severity: 'error' });
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Login
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            id="username"
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            margin="normal"
            fullWidth
            required
            autoComplete="username"
            error={submitted && username.trim().length === 0}
            helperText={submitted && username.trim().length === 0 ? 'Username is required' : ''}
          />

          <TextField
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            fullWidth
            required
            autoComplete="current-password"
            error={submitted && password.length === 0}
            helperText={submitted && password.length === 0 ? 'Password is required' : ''}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            disabled={!canSubmit}
          >
            Sign in
          </Button>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Username and password are required to continue.
        </Typography>

        <Button
          variant="text"
          color="secondary"
          fullWidth
          sx={{ mt: 1 }}
          onClick={onSwitchToRegister}
        >
          Don’t have an account? Register
        </Button>
      </Paper>
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default Login;
