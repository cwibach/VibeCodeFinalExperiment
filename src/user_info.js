import React from 'react';
import { Container, Paper, Typography } from '@mui/material';

function UserInfo({ user }) {
  if (!user) {
    return null;
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 2 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Profile
        </Typography>

        <Typography variant="subtitle1" sx={{ mt: 1 }}>
          Name: {user.name}
        </Typography>
        <Typography variant="subtitle1" sx={{ mt: 1 }}>
          Username: {user.username}
        </Typography>
        <Typography variant="subtitle1" sx={{ mt: 1 }}>
          Email: {user.email}
        </Typography>
        <Typography variant="subtitle1" sx={{ mt: 1 }}>
          Date of Birth: {user.dob}
        </Typography>
      </Paper>
    </Container>
  );
}

export default UserInfo;
