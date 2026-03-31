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
        <AppBar
          position="static"
          sx={{
            background: 'linear-gradient(90deg, rgba(255,0,212,0.92), rgba(74,0,255,0.94), rgba(0,255,246,0.9))',
            borderBottom: '2px solid rgba(255,255,255,0.8)',
            boxShadow: '0 0 20px rgba(120, 0, 255, 0.75)',
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                className={activePage === 'profile' ? 'nav-button active-nav' : 'nav-button'}
                variant={activePage === 'profile' ? 'contained' : 'outlined'}
                onClick={() => setActivePage('profile')}
                aria-pressed={activePage === 'profile'}
              >
                Profile
              </Button>
              <Button
                className={activePage === 'feed' ? 'nav-button active-nav' : 'nav-button'}
                variant={activePage === 'feed' ? 'contained' : 'outlined'}
                onClick={() => setActivePage('feed')}
                aria-pressed={activePage === 'feed'}
              >
                Global Feed
              </Button>
              <Button
                className={activePage === 'post' ? 'nav-button active-nav' : 'nav-button'}
                variant={activePage === 'post' ? 'contained' : 'outlined'}
                onClick={() => setActivePage('post')}
                aria-pressed={activePage === 'post'}
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

        <Container className={`page-${activePage}`} sx={{ mt: 3 }}>
          {activePage === 'profile' && <UserInfo user={user} />}
          {activePage === 'feed' && <FeedPage user={user} />}
          {activePage === 'post' && <PostPage user={user} />}
        </Container>
      </>
    );
  };

  const appClassName = mode === 'dashboard' ? `App page-${activePage}` : 'App';

  return (
    <div className={appClassName}>
      {mode === 'login' && (
        <Login onSwitchToRegister={() => setMode('register')} onLoginSuccess={handleLoginSuccess} />
      )}

      {mode === 'register' && <Register onSwitchToLogin={() => setMode('login')} />}

      {mode === 'dashboard' && renderDashboard()}
    </div>
  );
}

export default App;
