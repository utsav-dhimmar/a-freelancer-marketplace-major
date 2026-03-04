import { describe, it, expect, vi, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { emailService } from '../services/email.service.js';
import path from 'path';
import fs from 'fs';

// Mock email service
vi.mock('../services/email.service.js', () => ({
  emailService: {
    sendWelcomeEmail: vi.fn().mockResolvedValue(true),
  },
}));

describe('User APIs', () => {
  const testUser = {
    username: 'testuser',
    fullname: 'Test User',
    email: 'testuser@example.com',
    password: 'password123',
    role: 'client',
  };

  const dummyImagePath = path.join(__dirname, 'test-image.png');

  beforeAll(() => {
    // Create a dummy image for testing
    if (!fs.existsSync(dummyImagePath)) {
      fs.writeFileSync(dummyImagePath, 'dummy content');
    }
  });

  describe('POST /api/users/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .field('username', testUser.username)
        .field('fullname', testUser.fullname)
        .field('email', testUser.email)
        .field('password', testUser.password)
        .field('role', testUser.role)
        .attach('profilePicture', dummyImagePath);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(testUser.email);
      expect(res.body.data.accessToken).toBeDefined();
      expect(emailService.sendWelcomeEmail).toHaveBeenCalled();
    });

    it('should return 400 for missing fields', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send({ username: 'missing' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/users/login', () => {
    it('should login successfully', async () => {
      // Re-register user because afterEach clears DB
      await request(app)
        .post('/api/users/register')
        .field('username', testUser.username)
        .field('fullname', testUser.fullname)
        .field('email', testUser.email)
        .field('password', testUser.password)
        .field('role', testUser.role)
        .attach('profilePicture', dummyImagePath);

      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      if (res.status !== 200) console.log(res.body);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
    });

    it('should return 401 for incorrect password', async () => {
      // Re-register user
      await request(app)
        .post('/api/users/register')
        .field('username', testUser.username)
        .field('fullname', testUser.fullname)
        .field('email', testUser.email)
        .field('password', testUser.password)
        .field('role', testUser.role)
        .attach('profilePicture', dummyImagePath);

      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/users/me', () => {
    it('should retrieve current user info with valid token', async () => {
      // Re-register user
      await request(app)
        .post('/api/users/register')
        .field('username', testUser.username)
        .field('fullname', testUser.fullname)
        .field('email', testUser.email)
        .field('password', testUser.password)
        .field('role', testUser.role)
        .attach('profilePicture', dummyImagePath);

      // First login to get token
      const loginRes = await request(app)
        .post('/api/users/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });
      
      const token = loginRes.body.data.accessToken;

      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe(testUser.email);
    });

    it('should return 401 without token', async () => {
      const res = await request(app).get('/api/users/me');
      expect(res.status).toBe(401);
    });
  });
});
