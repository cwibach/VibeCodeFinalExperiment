import React, { useState } from 'react';
import { Box, Button, Container, Paper, TextField, Typography, Alert } from '@mui/material';

function PostPage({ user }) {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!user) {
      setError('User not logged in. Please login to create a post.');
      return;
    }

    const trimmedTitle = title.trim();
    const trimmedBody = body.trim();

    if (!trimmedTitle) {
      setError('Title is required.');
      return;
    }

    if (trimmedTitle.length > 100) {
      setError('Title must be 100 characters or fewer.');
      return;
    }

    if (!trimmedBody) {
      setError('Body is required.');
      return;
    }

    if (trimmedBody.length > 1000) {
      setError('Body must be 1000 characters or fewer.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: trimmedTitle,
          body: trimmedBody,
          username: user.username,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data?.message || 'Failed to create post.');
      } else {
        setSuccess('Post created successfully!');
        setTitle('');
        setBody('');
      }
    } catch (err) {
      console.error('Post creation error:', err);
      setError('Network error: could not reach post creation server.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 2 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          New Post
        </Typography>

        {!user ? (
          <Typography variant="body1" sx={{ mt: 2 }}>
            Please log in to create a post.
          </Typography>
        ) : (
          <Box component="form" onSubmit={handleSubmit} noValidate>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}

            <TextField
              label="Title"
              fullWidth
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              inputProps={{ maxLength: 100 }}
              helperText={`${title.length}/100`}
              margin="normal"
              required
            />

            <TextField
              label="Body"
              fullWidth
              multiline
              rows={8}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              inputProps={{ maxLength: 1000 }}
              helperText={`${body.length}/1000`}
              margin="normal"
              required
            />

            <Button type="submit" variant="contained" color="primary" disabled={submitting} sx={{ mt: 2 }}>
              {submitting ? 'Posting...' : 'Submit Post'}
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
}

export default PostPage;
