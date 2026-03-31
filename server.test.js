const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;
let app;
let User;
let Log;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  process.env.MONGODB_URI = uri;
  process.env.NODE_ENV = 'test';
  process.env.BACKEND_PORT = '0';

  app = require('./server');

  await mongoose.connection.asPromise();

  User = require('./models/User');
  Log = require('./models/Log');
});

afterEach(async () => {
  await User.deleteMany({});
  await Log.deleteMany({});
  const Post = require('./models/Post');
  await Post.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});

describe('Authentication and audit logging', () => {
  test('should fail registration with missing fields and log error', async () => {
    const res = await request(app).post('/api/register').send({ username: 'testuser' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', 'Name, username, password, email and date of birth are required.');

    const log = await Log.findOne({ action: 'registration' }).sort({ createdAt: -1 });
    expect(log).not.toBeNull();
    expect(log.success).toBe(false);
    expect(log.level).toBe('ERROR');
    expect(log.message).toBe('Name, username, password, email and date of birth are required.');
  });

  test('should register successfully and log info', async () => {
    const payload = {
      name: 'Test User',
      username: 'testuser',
      password: 'password123',
      email: 'test@example.com',
      dob: '1990-01-01',
    };

    const res = await request(app).post('/api/register').send(payload);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('message', 'User registered successfully.');

    const log = await Log.findOne({ action: 'registration' }).sort({ createdAt: -1 });
    expect(log).not.toBeNull();
    expect(log.success).toBe(true);
    expect(log.level).toBe('INFO');
    expect(log.message).toBe('User registered successfully.');
    expect(log.username).toBe('testuser');
  });

  test('should register with bio and avatar and return on user fetch', async () => {
    const payload = {
      name: 'Rich User',
      username: 'richuser',
      password: 'password123',
      email: 'rich@example.com',
      dob: '1985-05-05',
      bio: 'Hello, I love microblogging.',
      avatarUrl: 'https://example.com/avatar.jpg',
    };

    const res = await request(app).post('/api/register').send(payload);
    expect(res.status).toBe(201);

    const loginRes = await request(app).post('/api/login').send({ username: 'richuser', password: 'password123' });
    expect(loginRes.status).toBe(200);
    expect(loginRes.body.user).toHaveProperty('bio', 'Hello, I love microblogging.');
    expect(loginRes.body.user).toHaveProperty('avatarUrl', 'https://example.com/avatar.jpg');

    const profile = await request(app).get('/api/users/richuser');
    expect(profile.status).toBe(200);
    expect(profile.body.user).toHaveProperty('bio', 'Hello, I love microblogging.');
    expect(profile.body.user).toHaveProperty('avatarUrl', 'https://example.com/avatar.jpg');

    const log = await Log.findOne({ action: 'registration' }).sort({ createdAt: -1 });
    expect(log).not.toBeNull();
    expect(log.success).toBe(true);
  });

  test('should fail login with missing fields and log error', async () => {
    const res = await request(app).post('/api/login').send({ username: 'testuser' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', 'Username and password are required.');

    const log = await Log.findOne({ action: 'login' }).sort({ createdAt: -1 });
    expect(log).not.toBeNull();
    expect(log.success).toBe(false);
    expect(log.level).toBe('ERROR');
    expect(log.message).toBe('Username and password are required.');
  });

  test('should fail login with invalid password and log error', async () => {
    await request(app).post('/api/register').send({
      name: 'Test User',
      username: 'testuser',
      password: 'correctPassword',
      email: 'test@example.com',
      dob: '1990-01-01',
    });

    const res = await request(app).post('/api/login').send({ username: 'testuser', password: 'wrongPassword' });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message', 'Invalid username or password.');

    const log = await Log.findOne({ action: 'login' }).sort({ createdAt: -1 });
    expect(log).not.toBeNull();
    expect(log.success).toBe(false);
    expect(log.level).toBe('ERROR');
    expect(log.message).toBe('Invalid username or password.');
    expect(log.username).toBe('testuser');
  });

  test('should login successfully with correct credentials and log info', async () => {
    await request(app).post('/api/register').send({
      name: 'Test User',
      username: 'testuser',
      password: 'correctPassword',
      email: 'test@example.com',
      dob: '1990-01-01',
    });

    const res = await request(app).post('/api/login').send({ username: 'testuser', password: 'correctPassword' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Login successful.');
    expect(res.body.user).toHaveProperty('username', 'testuser');

    const log = await Log.findOne({ action: 'login' }).sort({ createdAt: -1 });
    expect(log).not.toBeNull();
    expect(log.success).toBe(true);
    expect(log.level).toBe('INFO');
    expect(log.message).toBe('Login successful.');
    expect(log.username).toBe('testuser');
  });

  test('should fail to create a post with missing fields and log error', async () => {
    await request(app).post('/api/register').send({
      name: 'Test User',
      username: 'testuser',
      password: 'correctPassword',
      email: 'test@example.com',
      dob: '1990-01-01',
    });

    const res = await request(app).post('/api/posts').send({ username: 'testuser', title: 'Hello' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', 'Title, body, and username are required.');

    const log = await Log.findOne({ action: 'post_creation' }).sort({ createdAt: -1 });
    expect(log).not.toBeNull();
    expect(log.success).toBe(false);
    expect(log.level).toBe('ERROR');
    expect(log.message).toBe('Title, body, and username are required.');
  });

  test('should fail to create a post with too long fields and log error', async () => {
    await request(app).post('/api/register').send({
      name: 'Test User',
      username: 'testuser',
      password: 'correctPassword',
      email: 'test@example.com',
      dob: '1990-01-01',
    });

    const title = 'a'.repeat(101);
    let res = await request(app).post('/api/posts').send({ username: 'testuser', title, body: 'valid body' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', 'Title must be between 1 and 100 characters.');

    res = await request(app).post('/api/posts').send({ username: 'testuser', title: 'Valid', body: 'b'.repeat(1001) });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', 'Body must be between 1 and 1000 characters.');

    const log = await Log.findOne({ action: 'post_creation' }).sort({ createdAt: -1 });
    expect(log).not.toBeNull();
    expect(log.success).toBe(false);
    expect(log.level).toBe('ERROR');
    expect(['Body must be between 1 and 1000 characters.', 'Title must be between 1 and 100 characters.']).toContain(log.message);
  });

  test('should create post successfully and verify log and user-specific feed', async () => {
    await request(app).post('/api/register').send({
      name: 'Test User',
      username: 'testuser',
      password: 'correctPassword',
      email: 'test@example.com',
      dob: '1990-01-01',
    });

    const res = await request(app).post('/api/posts').send({
      username: 'testuser',
      title: 'My First Post',
      body: 'This is my first post body.',
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('message', 'Post created successfully.');
    expect(res.body.post).toHaveProperty('title', 'My First Post');

    const postLog = await Log.findOne({ action: 'post_creation' }).sort({ createdAt: -1 });
    expect(postLog).not.toBeNull();
    expect(postLog.success).toBe(true);
    expect(postLog.level).toBe('INFO');
    expect(postLog.message).toBe('Post created successfully.');
    expect(postLog.username).toBe('testuser');

    const feed = await request(app).get('/api/posts').query({ username: 'testuser', page: 1, limit: 10 });
    expect(feed.status).toBe(200);
    expect(feed.body).toHaveProperty('posts');
    expect(feed.body.posts.length).toBe(1);
    expect(feed.body.posts[0]).toHaveProperty('authorUsername', 'testuser');

    const userRes = await request(app).get('/api/users/testuser');
    expect(userRes.status).toBe(200);
    expect(userRes.body).toHaveProperty('user');
    expect(userRes.body.user).toHaveProperty('username', 'testuser');
    expect(userRes.body.user).toHaveProperty('email', 'test@example.com');
  });

  test('should handle like/unlike/reply flows and log correctly', async () => {
    await request(app).post('/api/register').send({
      name: 'Test User',
      username: 'testuser',
      password: 'correctPassword',
      email: 'test@example.com',
      dob: '1990-01-01',
    });

    const postRes = await request(app).post('/api/posts').send({
      username: 'testuser',
      title: 'Post to interact with',
      body: 'An interactive post',
    });
    expect(postRes.status).toBe(201);
    const postId = postRes.body.post._id;

    // Like success
    const likeRes = await request(app).post(`/api/posts/${postId}/like`).send({ username: 'testuser' });
    expect(likeRes.status).toBe(200);
    expect(likeRes.body).toHaveProperty('post');
    expect(likeRes.body.post.likes).toBe(1);

    let log = await Log.findOne({ action: 'like' }).sort({ createdAt: -1 });
    expect(log.success).toBe(true);
    expect(log.level).toBe('INFO');
    expect(log.message).toBe('Post liked.');

    // Liking again fails
    const likeAgainRes = await request(app).post(`/api/posts/${postId}/like`).send({ username: 'testuser' });
    expect(likeAgainRes.status).toBe(400);
    expect(likeAgainRes.body.message).toBe('Already liked.');

    log = await Log.findOne({ action: 'like' }).sort({ createdAt: -1 });
    expect(log.success).toBe(false);
    expect(log.level).toBe('ERROR');

    // Unlike success
    const unlikeRes = await request(app).post(`/api/posts/${postId}/unlike`).send({ username: 'testuser' });
    expect(unlikeRes.status).toBe(200);
    expect(unlikeRes.body.post.likes).toBe(0);

    log = await Log.findOne({ action: 'unlike' }).sort({ createdAt: -1 });
    expect(log.success).toBe(true);
    expect(log.message).toBe('Post unliked.');

    // Unlike again fails
    const unlikeAgainRes = await request(app).post(`/api/posts/${postId}/unlike`).send({ username: 'testuser' });
    expect(unlikeAgainRes.status).toBe(400);
    expect(unlikeAgainRes.body.message).toBe('Post is not currently liked.');

    log = await Log.findOne({ action: 'unlike' }).sort({ createdAt: -1 });
    expect(log.success).toBe(false);
    expect(log.level).toBe('ERROR');

    // Reply cases
    const replyMissingRes = await request(app).post(`/api/posts/${postId}/reply`).send({ username: 'testuser' });
    expect(replyMissingRes.status).toBe(400);
    expect(replyMissingRes.body.message).toBe('Username and reply body are required.');

    const replyTooLongRes = await request(app)
      .post(`/api/posts/${postId}/reply`)
      .send({ username: 'testuser', body: 'a'.repeat(281) });
    expect(replyTooLongRes.status).toBe(400);
    expect(replyTooLongRes.body.message).toBe('Reply must be between 1 and 280 characters.');

    const replyRes = await request(app)
      .post(`/api/posts/${postId}/reply`)
      .send({ username: 'testuser', body: 'Nice post!' });
    expect(replyRes.status).toBe(200);
    expect(replyRes.body.post.replies.length).toBe(1);
    expect(replyRes.body.post.replies[0].body).toBe('Nice post!');

    log = await Log.findOne({ action: 'reply' }).sort({ createdAt: -1 });
    expect(log.success).toBe(true);
    expect(log.message).toBe('Reply added.');
  });

  test('should have pagination edge cases and user not found', async () => {
    await request(app).post('/api/register').send({
      name: 'Test User',
      username: 'testuser',
      password: 'correctPassword',
      email: 'test@example.com',
      dob: '1990-01-01',
    });

    for (let i = 0; i < 11; i += 1) {
      await request(app).post('/api/posts').send({
        username: 'testuser',
        title: `Post ${i + 1}`,
        body: 'Testing pagination.',
      });
    }

    const page1 = await request(app).get('/api/posts').query({ page: 1, limit: 10 });
    expect(page1.status).toBe(200);
    expect(page1.body.posts.length).toBe(10);
    expect(page1.body.hasNextPage).toBe(true);

    const page2 = await request(app).get('/api/posts').query({ page: 2, limit: 10 });
    expect(page2.status).toBe(200);
    expect(page2.body.posts.length).toBe(1);
    expect(page2.body.hasNextPage).toBe(false);

    const page3 = await request(app).get('/api/posts').query({ page: 3, limit: 10 });
    expect(page3.status).toBe(200);
    expect(page3.body.posts.length).toBe(0);

    const userRes = await request(app).get('/api/users/nonexistent');
    expect(userRes.status).toBe(404);
    expect(userRes.body.message).toBe('User not found.');
  });
});
