const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');
const Post = require('./models/Post');
const Log = require('./models/Log');

const app = express();
const PORT = process.env.BACKEND_PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vibetwitterlike';

app.use(cors());
app.use(express.json());

function sanitizeForLog(value) {
  if (value === undefined || value === null) return null;
  if (typeof value === 'string') {
    return value.trim().substring(0, 1000);
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }
  if (Array.isArray(value)) {
    return value.slice(0, 100).map((item) => sanitizeForLog(item));
  }
  if (typeof value === 'object') {
    const sanitized = {};
    Object.keys(value).slice(0, 50).forEach((key) => {
      if (key.toLowerCase().includes('password')) return;
      sanitized[key] = sanitizeForLog(value[key]);
    });
    return sanitized;
  }
  return String(value);
}

async function createLog({ action, username, success, level, message, metadata }) {
  try {
    const log = new Log({
      action: sanitizeForLog(action),
      username: username ? sanitizeForLog(username).toLowerCase() : undefined,
      success: !!success,
      level: ['INFO', 'DEBUG', 'ERROR'].includes(level) ? level : 'INFO',
      message: sanitizeForLog(message),
      metadata: sanitizeForLog(metadata) || {},
    });
    await log.save();
  } catch (logError) {
    console.error('Failed to create log:', logError);
  }
}

app.get('/api/ping', (req, res) => {
  res.json({ status: 'ok', message: 'Backend healthy' });
});

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log(`MongoDB connected at ${MONGODB_URI}`))
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

app.post('/api/register', async (req, res) => {
  try {
    const { name, username, password, email, dob, bio, avatarUrl } = req.body;

    const metadata = { name, username, email, dob, bio, avatarUrl };

    if (!name || !username || !password || !email || !dob) {
      await createLog({
        action: 'registration',
        username: username || 'unknown',
        success: false,
        level: 'ERROR',
        message: 'Name, username, password, email and date of birth are required.',
        metadata,
      });
      return res.status(400).json({ success: false, message: 'Name, username, password, email and date of birth are required.' });
    }

    const normalizedUsername = username.trim().toLowerCase();
    const normalizedEmail = email.trim().toLowerCase();

    if (await User.findOne({ username: normalizedUsername })) {
      await createLog({
        action: 'registration',
        username: normalizedUsername,
        success: false,
        level: 'ERROR',
        message: 'Username already exists.',
        metadata,
      });
      return res.status(409).json({ success: false, message: 'Username already exists.' });
    }

    if (await User.findOne({ email: normalizedEmail })) {
      await createLog({
        action: 'registration',
        username: normalizedUsername,
        success: false,
        level: 'ERROR',
        message: 'Email already exists.',
        metadata,
      });
      return res.status(409).json({ success: false, message: 'Email already exists.' });
    }

    if (bio && bio.trim().length > 500) {
      await createLog({
        action: 'registration',
        username: normalizedUsername,
        success: false,
        level: 'ERROR',
        message: 'Bio must be 500 characters or fewer.',
        metadata,
      });
      return res.status(400).json({ success: false, message: 'Bio must be 500 characters or fewer.' });
    }

    if (avatarUrl && avatarUrl.trim().length > 1000) {
      await createLog({
        action: 'registration',
        username: normalizedUsername,
        success: false,
        level: 'ERROR',
        message: 'Avatar URL must be 1000 characters or fewer.',
        metadata,
      });
      return res.status(400).json({ success: false, message: 'Avatar URL must be 1000 characters or fewer.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      name: name.trim(),
      username: normalizedUsername,
      email: normalizedEmail,
      passwordHash,
      dob: new Date(dob),
      bio: bio ? bio.trim() : '',
      avatarUrl: avatarUrl ? avatarUrl.trim() : '',
    });

    await user.save();

    await createLog({
      action: 'registration',
      username: normalizedUsername,
      success: true,
      level: 'INFO',
      message: 'User registered successfully.',
      metadata,
    });

    return res.status(201).json({ success: true, message: 'User registered successfully.' });
  } catch (error) {
    console.error('Registration error:', error);
    await createLog({
      action: 'registration',
      username: req.body.username || 'unknown',
      success: false,
      level: 'ERROR',
      message: 'Server error while registering user.',
      metadata: sanitizeForLog(req.body),
    });
    return res.status(500).json({ success: false, message: 'Server error while registering user.' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const metadata = { username };

    if (!username || !password) {
      await createLog({
        action: 'login',
        username: username || 'unknown',
        success: false,
        level: 'ERROR',
        message: 'Username and password are required.',
        metadata,
      });
      return res.status(400).json({ success: false, message: 'Username and password are required.' });
    }

    const normalizedUsername = username.trim().toLowerCase();
    const user = await User.findOne({ username: normalizedUsername });

    if (!user) {
      await createLog({
        action: 'login',
        username: normalizedUsername,
        success: false,
        level: 'ERROR',
        message: 'Invalid username or password.',
        metadata,
      });
      return res.status(401).json({ success: false, message: 'Invalid username or password.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
      await createLog({
        action: 'login',
        username: normalizedUsername,
        success: false,
        level: 'ERROR',
        message: 'Invalid username or password.',
        metadata,
      });
      return res.status(401).json({ success: false, message: 'Invalid username or password.' });
    }

    const responseUser = {
      name: user.name,
      username: user.username,
      email: user.email,
      dob: user.dob ? user.dob.toISOString().split('T')[0] : '',
      bio: user.bio || '',
      avatarUrl: user.avatarUrl || '',
    };

    await createLog({
      action: 'login',
      username: normalizedUsername,
      success: true,
      level: 'INFO',
      message: 'Login successful.',
      metadata,
    });

    return res.status(200).json({ success: true, message: 'Login successful.', user: responseUser });
  } catch (error) {
    console.error('Login error:', error);
    await createLog({
      action: 'login',
      username: req.body.username || 'unknown',
      success: false,
      level: 'ERROR',
      message: 'Server error while logging in.',
      metadata: sanitizeForLog(req.body),
    });
    return res.status(500).json({ success: false, message: 'Server error while logging in.' });
  }
});

app.post('/api/posts', async (req, res) => {
  try {
    const { title, body, username } = req.body;
    const metadata = { title, username };

    if (!title || !body || !username) {
      await createLog({
        action: 'post_creation',
        username: username || 'unknown',
        success: false,
        level: 'ERROR',
        message: 'Title, body, and username are required.',
        metadata,
      });
      return res.status(400).json({ success: false, message: 'Title, body, and username are required.' });
    }

    const trimmedTitle = title.trim();
    const trimmedBody = body.trim();
    const normalizedUsername = username.trim().toLowerCase();

    if (trimmedTitle.length === 0 || trimmedTitle.length > 100) {
      await createLog({
        action: 'post_creation',
        username: normalizedUsername,
        success: false,
        level: 'ERROR',
        message: 'Title must be between 1 and 100 characters.',
        metadata,
      });
      return res.status(400).json({ success: false, message: 'Title must be between 1 and 100 characters.' });
    }

    if (trimmedBody.length === 0 || trimmedBody.length > 1000) {
      await createLog({
        action: 'post_creation',
        username: normalizedUsername,
        success: false,
        level: 'ERROR',
        message: 'Body must be between 1 and 1000 characters.',
        metadata,
      });
      return res.status(400).json({ success: false, message: 'Body must be between 1 and 1000 characters.' });
    }

    const user = await User.findOne({ username: normalizedUsername });
    if (!user) {
      await createLog({
        action: 'post_creation',
        username: normalizedUsername,
        success: false,
        level: 'ERROR',
        message: 'Invalid user, please login again.',
        metadata,
      });
      return res.status(401).json({ success: false, message: 'Invalid user, please login again.' });
    }

    const post = new Post({
      title: trimmedTitle,
      body: trimmedBody,
      authorUsername: user.username,
      authorName: user.name,
    });

    await post.save();

    await createLog({
      action: 'post_creation',
      username: normalizedUsername,
      success: true,
      level: 'INFO',
      message: 'Post created successfully.',
      metadata,
    });

    return res.status(201).json({ success: true, message: 'Post created successfully.', post });
  } catch (error) {
    console.error('Create post error:', error);
    await createLog({
      action: 'post_creation',
      username: req.body.username || 'unknown',
      success: false,
      level: 'ERROR',
      message: 'Server error while creating post.',
      metadata: sanitizeForLog(req.body),
    });
    return res.status(500).json({ success: false, message: 'Server error while creating post.' });
  }
});

app.get('/api/posts', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;
    const username = req.query.username ? req.query.username.trim().toLowerCase() : null;

    const filter = username ? { authorUsername: username } : {};
    const total = await Post.countDocuments(filter);
    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalPages = Math.ceil(total / limit);

    return res.json({
      success: true,
      page,
      totalPages,
      limit,
      total,
      posts,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages,
      authorFilter: username || null,
    });
  } catch (error) {
    console.error('Fetch posts error:', error);
    return res.status(500).json({ success: false, message: 'Server error while fetching posts.' });
  }
});

app.get('/api/users/:username', async (req, res) => {
  try {
    const username = req.params.username.trim().toLowerCase();
    if (!username) {
      return res.status(400).json({ success: false, message: 'Username is required.' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const responseUser = {
      name: user.name,
      username: user.username,
      email: user.email,
      dob: user.dob ? user.dob.toISOString().split('T')[0] : '',
      bio: user.bio || '',
      avatarUrl: user.avatarUrl || '',
      createdAt: user.createdAt,
    };

    return res.json({ success: true, user: responseUser });
  } catch (error) {
    console.error('Fetch user profile error:', error);
    return res.status(500).json({ success: false, message: 'Server error while fetching user profile.' });
  }
});

app.post('/api/posts/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    const { username } = req.body;
    const metadata = { postId: id, username };

    if (!username) {
      await createLog({
        action: 'like',
        username: 'unknown',
        success: false,
        level: 'ERROR',
        message: 'Username is required to like a post.',
        metadata,
      });
      return res.status(400).json({ success: false, message: 'Username is required to like a post.' });
    }

    const normalizedUsername = username.trim().toLowerCase();
    const user = await User.findOne({ username: normalizedUsername });

    if (!user) {
      await createLog({
        action: 'like',
        username: normalizedUsername,
        success: false,
        level: 'ERROR',
        message: 'Invalid user.',
        metadata,
      });
      return res.status(401).json({ success: false, message: 'Invalid user.' });
    }

    const post = await Post.findById(id);
    if (!post) {
      await createLog({
        action: 'like',
        username: normalizedUsername,
        success: false,
        level: 'ERROR',
        message: 'Post not found.',
        metadata,
      });
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    if (post.likedBy.includes(normalizedUsername)) {
      await createLog({
        action: 'like',
        username: normalizedUsername,
        success: false,
        level: 'ERROR',
        message: 'Already liked.',
        metadata,
      });
      return res.status(400).json({ success: false, message: 'Already liked.' });
    }

    post.likedBy.push(normalizedUsername);
    post.likes = post.likedBy.length;
    await post.save();

    await createLog({
      action: 'like',
      username: normalizedUsername,
      success: true,
      level: 'INFO',
      message: 'Post liked.',
      metadata,
    });

    return res.json({ success: true, message: 'Post liked.', post });
  } catch (error) {
    console.error('Like post error:', error);
    await createLog({
      action: 'like',
      username: req.body.username || 'unknown',
      success: false,
      level: 'ERROR',
      message: 'Server error while liking post.',
      metadata: sanitizeForLog(req.body),
    });
    return res.status(500).json({ success: false, message: 'Server error while liking post.' });
  }
});

app.post('/api/posts/:id/unlike', async (req, res) => {
  try {
    const { id } = req.params;
    const { username } = req.body;
    const metadata = { postId: id, username };

    if (!username) {
      await createLog({
        action: 'unlike',
        username: 'unknown',
        success: false,
        level: 'ERROR',
        message: 'Username is required to unlike a post.',
        metadata,
      });
      return res.status(400).json({ success: false, message: 'Username is required to unlike a post.' });
    }

    const normalizedUsername = username.trim().toLowerCase();
    const user = await User.findOne({ username: normalizedUsername });

    if (!user) {
      await createLog({
        action: 'unlike',
        username: normalizedUsername,
        success: false,
        level: 'ERROR',
        message: 'Invalid user.',
        metadata,
      });
      return res.status(401).json({ success: false, message: 'Invalid user.' });
    }

    const post = await Post.findById(id);
    if (!post) {
      await createLog({
        action: 'unlike',
        username: normalizedUsername,
        success: false,
        level: 'ERROR',
        message: 'Post not found.',
        metadata,
      });
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    if (!post.likedBy.includes(normalizedUsername)) {
      await createLog({
        action: 'unlike',
        username: normalizedUsername,
        success: false,
        level: 'ERROR',
        message: 'Post is not currently liked.',
        metadata,
      });
      return res.status(400).json({ success: false, message: 'Post is not currently liked.' });
    }

    post.likedBy = post.likedBy.filter((u) => u !== normalizedUsername);
    post.likes = post.likedBy.length;
    await post.save();

    await createLog({
      action: 'unlike',
      username: normalizedUsername,
      success: true,
      level: 'INFO',
      message: 'Post unliked.',
      metadata,
    });

    return res.json({ success: true, message: 'Post unliked.', post });
  } catch (error) {
    console.error('Unlike post error:', error);
    await createLog({
      action: 'unlike',
      username: req.body.username || 'unknown',
      success: false,
      level: 'ERROR',
      message: 'Server error while unliking post.',
      metadata: sanitizeForLog(req.body),
    });
    return res.status(500).json({ success: false, message: 'Server error while unliking post.' });
  }
});

app.post('/api/posts/:id/reply', async (req, res) => {
  try {
    const { id } = req.params;
    const { username, body } = req.body;
    const metadata = { postId: id, username };

    if (!username || !body) {
      await createLog({
        action: 'reply',
        username: username || 'unknown',
        success: false,
        level: 'ERROR',
        message: 'Username and reply body are required.',
        metadata,
      });
      return res.status(400).json({ success: false, message: 'Username and reply body are required.' });
    }

    const trimmedBody = body.trim();
    if (trimmedBody.length === 0 || trimmedBody.length > 280) {
      await createLog({
        action: 'reply',
        username: username.trim().toLowerCase(),
        success: false,
        level: 'ERROR',
        message: 'Reply must be between 1 and 280 characters.',
        metadata,
      });
      return res.status(400).json({ success: false, message: 'Reply must be between 1 and 280 characters.' });
    }

    const normalizedUsername = username.trim().toLowerCase();
    const user = await User.findOne({ username: normalizedUsername });
    if (!user) {
      await createLog({
        action: 'reply',
        username: normalizedUsername,
        success: false,
        level: 'ERROR',
        message: 'Invalid user.',
        metadata,
      });
      return res.status(401).json({ success: false, message: 'Invalid user.' });
    }

    const post = await Post.findById(id);
    if (!post) {
      await createLog({
        action: 'reply',
        username: normalizedUsername,
        success: false,
        level: 'ERROR',
        message: 'Post not found.',
        metadata,
      });
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    post.replies.push({
      authorUsername: user.username,
      authorName: user.name,
      body: trimmedBody,
    });

    await post.save();

    await createLog({
      action: 'reply',
      username: normalizedUsername,
      success: true,
      level: 'INFO',
      message: 'Reply added.',
      metadata,
    });

    return res.json({ success: true, message: 'Reply added.', post });
  } catch (error) {
    console.error('Reply post error:', error);
    await createLog({
      action: 'reply',
      username: req.body.username || 'unknown',
      success: false,
      level: 'ERROR',
      message: 'Server error while adding reply.',
      metadata: sanitizeForLog(req.body),
    });
    return res.status(500).json({ success: false, message: 'Server error while adding reply.' });
  }
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Auth API server is running on port ${PORT}`);
  });
}

module.exports = app;
