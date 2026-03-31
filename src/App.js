import React, { useState } from 'react';
import './App.css';
import Login from './login';
import Register from './register';
import UserInfo from './user_info';
import FeedPage from './feed_page';
import PostPage from './post_page';
import { AppBar, Box, Button, Container, Toolbar, Typography } from '@mui/material';

function App() {
  const [mode, setMode] = useState('login');
  const [user, setUser] = useState(null);
  const [activePage, setActivePage] = useState('profile');

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setMode('dashboard');
    setActivePage('profile');
  };

  const handleLogout = () => {
    setUser(null);
    setMode('login');
  };

  const renderDashboard = () => {
    if (!user) {
      return null;
    }

    return (
      <>
        <AppBar position="static">
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Button
                color={activePage === 'profile' ? 'secondary' : 'inherit'}
                onClick={() => setActivePage('profile')}
              >
                Profile
              </Button>
              <Button
                color={activePage === 'feed' ? 'secondary' : 'inherit'}
                onClick={() => setActivePage('feed')}
              >
                Global Feed
              </Button>
              <Button
                color={activePage === 'post' ? 'secondary' : 'inherit'}
                onClick={() => setActivePage('post')}
              >
                New Post
              </Button>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="subtitle1" sx={{ mr: 2 }}>
                Logged in as {user.username}
              </Typography>
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </Box>
          </Toolbar>
        </AppBar>

        <Container sx={{ mt: 3 }}>
          {activePage === 'profile' && <UserInfo user={user} />}
          {activePage === 'feed' && <FeedPage user={user} />}
          {activePage === 'post' && <PostPage user={user} />}
        </Container>
      </>
    );
  };

  return (
    <div className="App">
      {mode === 'login' && (
        <Login onSwitchToRegister={() => setMode('register')} onLoginSuccess={handleLoginSuccess} />
      )}

      {mode === 'register' && <Register onSwitchToLogin={() => setMode('login')} />}

      {mode === 'dashboard' && renderDashboard()}
    </div>
  );
}

export default App;
