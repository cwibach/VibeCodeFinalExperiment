import React from 'react';
import { Box, Container, Paper, Typography } from '@mui/material';

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

        {user.avatarUrl && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <img src={user.avatarUrl} alt={`${user.username} avatar`} style={{ width: 120, height: 120, borderRadius: '50%' }} />
          </Box>
        )}

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

        {user.bio && (
          <Typography variant="body1" sx={{ mt: 2 }}>
            Bio: {user.bio}
          </Typography>
        )}
      </Paper>
    </Container>
  );
}

export default UserInfo;
