import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Pagination,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

function FeedPage({ user }) {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [replyBodyByPost, setReplyBodyByPost] = useState({});
  const [replyLoadingByPost, setReplyLoadingByPost] = useState({});
  const [authorFilter, setAuthorFilter] = useState(null);
  const [filterInfo, setFilterInfo] = useState('');
  const [authorProfile, setAuthorProfile] = useState(null);

  const fetchPosts = async (targetPage, usernameFilter = authorFilter) => {
    setLoading(true);
    setError('');

    try {
      let url = `${API_BASE_URL}/api/posts?page=${targetPage}&limit=10`;
      if (usernameFilter) {
        url += `&username=${encodeURIComponent(usernameFilter)}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to load feed.');
      }

      const data = await response.json();
      setPosts(data.posts || []);
      setPage(data.page || 1);
      setTotalPages(data.totalPages || 1);
      setFilterInfo(data.authorFilter ? `Showing posts by ${data.authorFilter}` : 'Showing all posts');

      if (usernameFilter) {
        const profileResponse = await fetch(`${API_BASE_URL}/api/users/${encodeURIComponent(usernameFilter)}`);
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setAuthorProfile(profileData.user || null);
        } else {
          setAuthorProfile(null);
        }
      } else {
        setAuthorProfile(null);
      }
    } catch (error) {
      setError(error.message || 'Network error: could not reach feed server.');
      setFilterInfo('');
      setAuthorProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLikeToggle = async (post) => {
    if (!user) {
      setError('You must be logged in to like posts.');
      return;
    }

    setActionLoading(true);
    setError('');

    const isLiked = Array.isArray(post.likedBy) && post.likedBy.includes(user.username);
    const endpoint = `${API_BASE_URL}/api/posts/${post._id}/${isLiked ? 'unlike' : 'like'}`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: user.username }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update like status.');
      }

      const data = await response.json();
      const updatedPost = data.post;
      setPosts((prev) => prev.map((p) => (p._id === updatedPost._id ? updatedPost : p)));
    } catch (error) {
      setError(error.message || 'Network error: could not reach feed server.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReplySubmit = async (post) => {
    if (!user) {
      setError('You must be logged in to reply to posts.');
      return;
    }

    const body = (replyBodyByPost[post._id] || '').trim();
    if (body.length === 0) {
      setError('Reply body is required.');
      return;
    }
    if (body.length > 280) {
      setError('Reply must be no more than 280 characters.');
      return;
    }

    setReplyLoadingByPost((prev) => ({ ...prev, [post._id]: true }));
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/posts/${post._id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: user.username, body }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send reply.');
      }

      const data = await response.json();
      const updatedPost = data.post;
      setPosts((prev) => prev.map((p) => (p._id === updatedPost._id ? updatedPost : p)));
      setReplyBodyByPost((prev) => ({ ...prev, [post._id]: '' }));
    } catch (error) {
      setError(error.message || 'Network error: could not reach feed server.');
    } finally {
      setReplyLoadingByPost((prev) => ({ ...prev, [post._id]: false }));
    }
  };

  const handleAuthorSelect = (username) => {
    setAuthorFilter(username);
    setPage(1);
    setError('');
    fetchPosts(1, username);
  };

  const clearAuthorFilter = () => {
    setAuthorFilter(null);
    setAuthorProfile(null);
    setPage(1);
    setError('');
    fetchPosts(1, null);
  };

  useEffect(() => {
    fetchPosts(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authorFilter]);

  const handlePageChange = (event, value) => {
    setPage(value);
    fetchPosts(value, authorFilter);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 2 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Global Feed
        </Typography>

        {authorFilter && (
          <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant="subtitle1" color="text.secondary">
              {`Showing posts by @${authorFilter}`}
            </Typography>
            <Button size="small" variant="outlined" onClick={clearAuthorFilter}>
              Show all
            </Button>
          </Box>
        )}

        {authorProfile && (
          <Paper elevation={1} sx={{ p: 2, mb: 2, bgcolor: '#fafafa' }}>
            <Typography variant="h6">User Profile</Typography>
            <Typography variant="body2">Name: {authorProfile.name}</Typography>
            <Typography variant="body2">Username: @{authorProfile.username}</Typography>
            <Typography variant="body2">Email: {authorProfile.email}</Typography>
            <Typography variant="body2">DOB: {authorProfile.dob}</Typography>
            <Typography variant="body2">Joined: {new Date(authorProfile.createdAt).toLocaleDateString()}</Typography>
          </Paper>
        )}

        {filterInfo && !authorFilter && (
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            {filterInfo}
          </Typography>
        )}

        {error && <Alert severity="error">{error}</Alert>}

        {!error && !loading && posts.length === 0 && (
          <Typography sx={{ mt: 2 }}>No posts yet. Check back later.</Typography>
        )}

        {loading ? (
          <Typography sx={{ mt: 2 }}>Loading posts...</Typography>
        ) : (
          <Stack spacing={2} sx={{ mt: 2 }}>
            {posts.map((post) => {
              const isLiked = Array.isArray(post.likedBy) && post.likedBy.includes(user?.username);

              return (
                <Card key={post._id} variant="outlined">
                  <CardContent>
                    <Typography variant="h6">{post.title}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      by{' '}
                      <Button
                        size="small"
                        variant="text"
                        onClick={() => handleAuthorSelect(post.authorUsername)}
                        sx={{ textTransform: 'none', p: 0, minWidth: 'auto' }}
                      >
                        {post.authorName}
                      </Button>{' '}
                      (@{post.authorUsername}) on {new Date(post.createdAt).toLocaleString()}
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 1 }}>
                      {post.body}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, gap: 1, flexWrap: 'wrap' }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#ffffff' }}>
                        Likes: {post.likes || 0}
                      </Typography>
                      <Button
                        size="small"
                        variant={isLiked ? 'contained' : 'outlined'}
                        sx={{
                          minWidth: 94,
                          fontWeight: 600,
                          color: isLiked ? '#000' : '#fff',
                          backgroundColor: isLiked ? '#fff' : 'rgba(255,255,255,0.1)',
                          borderColor: '#ffd600',
                          '&:hover': {
                            backgroundColor: isLiked ? '#f3f3f3' : 'rgba(255,255,255,0.2)',
                          },
                        }}
                        onClick={() => handleLikeToggle(post)}
                        disabled={actionLoading}
                        aria-label={isLiked ? 'Unlike this post' : 'Like this post'}
                        startIcon={isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                      >
                        {isLiked ? 'Unlike' : 'Like'}
                      </Button>
                    </Box>

                    <Box sx={{ mt: 2, p: 1, bgcolor: '#f9f9f9', borderRadius: 1 }}>
                      <Typography variant="subtitle2" className="replies-title">Replies</Typography>

                      {Array.isArray(post.replies) && post.replies.length === 0 && (
                        <Typography variant="body2" className="no-replies-text">
                          No replies yet.
                        </Typography>
                      )}

                      {Array.isArray(post.replies) && post.replies.map((reply, idx) => (
                        <Paper key={`${post._id}-reply-${idx}`} variant="outlined" className="reply-card" sx={{ p: 1, mt: 1 }}>
                          <Typography variant="body2" component="p" sx={{ fontWeight: 'bold' }}>
                            <Button
                              size="small"
                              variant="text"
                              onClick={() => handleAuthorSelect(reply.authorUsername)}
                              sx={{ textTransform: 'none', p: 0, minWidth: 'auto', color: '#c8ffd1' }}
                            >
                              {reply.authorName}
                            </Button>{' '}
                            (@{reply.authorUsername})
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(reply.createdAt).toLocaleString()}
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 0.5 }}>
                            {reply.body}
                          </Typography>
                        </Paper>
                      ))}

                      <Box sx={{ mt: 2 }}>
                        <TextField
                          label="Write a reply"
                          value={replyBodyByPost[post._id] || ''}
                          onChange={(e) =>
                            setReplyBodyByPost((prev) => ({ ...prev, [post._id]: e.target.value }))
                          }
                          fullWidth
                          multiline
                          rows={2}
                          inputProps={{ maxLength: 280 }}
                          variant="outlined"
                          size="small"
                          sx={{
                            '& .MuiInputBase-input': {
                              color: '#000000 !important',
                            },
                            '& .MuiInputLabel-root': {
                              color: '#000000 !important',
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'rgba(0,0,0,0.2) !important',
                            },
                          }}
                        />
                        <Button
                          sx={{ mt: 1 }}
                          variant="contained"
                          color="primary"
                          onClick={() => handleReplySubmit(post)}
                          disabled={replyLoadingByPost[post._id]}
                        >
                          {replyLoadingByPost[post._id] ? 'Submitting...' : 'Reply'}
                        </Button>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            siblingCount={0}
            boundaryCount={1}
          />
        </Box>

        <Grid container spacing={1} sx={{ mt: 1 }}>
          <Grid item>
            <Button
              variant="outlined"
              disabled={page <= 1 || loading}
              onClick={() => handlePageChange(null, page - 1)}
            >
              Previous
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              disabled={page >= totalPages || loading}
              onClick={() => handlePageChange(null, page + 1)}
            >
              Next
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}

export default FeedPage;
