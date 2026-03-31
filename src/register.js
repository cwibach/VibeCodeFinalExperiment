import React, { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const yearOptions = Array.from({ length: 100 }, (_, idx) => new Date().getFullYear() - idx);

function Register({ onSwitchToLogin }) {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [dobDay, setDobDay] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };
  const [dobMonth, setDobMonth] = useState('');
  const [dobYear, setDobYear] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const days = useMemo(() => {
    const daysCount = 31;
    return Array.from({ length: daysCount }, (_, i) => i + 1);
  }, []);

  const dobComplete = Boolean(name.trim() && username.trim() && password && email.trim() && dobDay && dobMonth && dobYear);

  const isValidDob = (year, month, day) => {
    const y = Number(year);
    const m = Number(month);
    const d = Number(day);
    if (!y || !m || !d) return false;
    const date = new Date(y, m - 1, d);
    return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
  };

  const handleInvalidDob = () => {
    setSnackbar({ open: true, message: 'Invalid date of birth selected. Please choose a real date.', severity: 'error' });
    setDobDay('');
    setDobMonth('');
    setDobYear('');
    setSubmitted(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitted(true);

    if (!dobComplete) {
      return;
    }

    if (!isValidDob(dobYear, dobMonth, dobDay)) {
      handleInvalidDob();
      return;
    }

    const dob = `${dobYear}-${dobMonth}-${dobDay}`;

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, username, password, email, dob, bio, avatarUrl }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('Registration successful');
        setSnackbar({ open: true, message: 'Registration successful. Please login.', severity: 'success' });
        onSwitchToLogin();
      } else {
        console.error('Registration failed', data.message || 'Unknown error');
        setSnackbar({ open: true, message: `Registration failed: ${data.message || 'Please try again'}`, severity: 'error' });
      }
    } catch (error) {
      console.error('Network error during registration', error);
      setSnackbar({ open: true, message: 'Network error: could not reach registration server.', severity: 'error' });
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Register
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            id="name"
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            margin="normal"
            fullWidth
            required
            error={submitted && name.trim().length === 0}
            helperText={submitted && name.trim().length === 0 ? 'Name is required' : ''}
          />

          <TextField
            id="reg-username"
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            margin="normal"
            fullWidth
            required
            error={submitted && username.trim().length === 0}
            helperText={submitted && username.trim().length === 0 ? 'Username is required' : ''}
          />

          <TextField
            id="reg-password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            fullWidth
            required
            error={submitted && password.length === 0}
            helperText={submitted && password.length === 0 ? 'Password is required' : ''}
          />

          <TextField
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            fullWidth
            required
            error={submitted && email.trim().length === 0}
            helperText={submitted && email.trim().length === 0 ? 'Email is required' : ''}
          />

          <TextField
            id="bio"
            label="Bio (optional)"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            margin="normal"
            fullWidth
            multiline
            rows={3}
            inputProps={{ maxLength: 500 }}
            helperText={`${bio.length}/500`}
          />

          <TextField
            id="avatarUrl"
            label="Avatar URL (optional)"
            type="url"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            margin="normal"
            fullWidth
            inputProps={{ maxLength: 1000 }}
          />

          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            Date of Birth
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <FormControl fullWidth required>
              <InputLabel id="dob-month-label">Month</InputLabel>
              <Select
                labelId="dob-month-label"
                id="dob-month"
                value={dobMonth}
                label="Month"
                onChange={(e) => setDobMonth(e.target.value)}
                error={submitted && !dobMonth}
              >
                {months.map((month, idx) => (
                  <MenuItem key={month} value={(idx + 1).toString().padStart(2, '0')}>
                    {month}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel id="dob-day-label">Day</InputLabel>
              <Select
                labelId="dob-day-label"
                id="dob-day"
                value={dobDay}
                label="Day"
                onChange={(e) => setDobDay(e.target.value)}
                error={submitted && !dobDay}
              >
                {days.map((day) => (
                  <MenuItem key={day} value={day.toString().padStart(2, '0')}>
                    {day}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel id="dob-year-label">Year</InputLabel>
              <Select
                labelId="dob-year-label"
                id="dob-year"
                value={dobYear}
                label="Year"
                onChange={(e) => setDobYear(e.target.value)}
                error={submitted && !dobYear}
              >
                {yearOptions.map((year) => (
                  <MenuItem key={year} value={year.toString()}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            disabled={!dobComplete}
          >
            Create account
          </Button>
        </Box>

        <Button
          variant="text"
          color="secondary"
          fullWidth
          sx={{ mt: 1 }}
          onClick={onSwitchToLogin}
        >
          Already have an account? Login
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

export default Register;
