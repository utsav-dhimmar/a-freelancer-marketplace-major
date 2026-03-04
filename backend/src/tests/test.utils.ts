import request from 'supertest';
import app from '../app.js';
import path from 'path';
import fs from 'fs';

export const registerAndLogin = async (role: 'client' | 'freelancer' | 'admin' = 'client') => {
  const username = `user_${Math.random().toString(36).substring(7)}`;
  const email = `${username}@example.com`;
  const password = 'password123';

  const dummyImagePath = path.join(__dirname, 'test-image.png');
  if (!fs.existsSync(dummyImagePath)) {
    fs.writeFileSync(dummyImagePath, 'dummy content');
  }

  // Register
  await request(app)
    .post('/api/users/register')
    .field('username', username)
    .field('fullname', 'Test User')
    .field('email', email)
    .field('password', password)
    .field('role', role)
    .attach('profilePicture', dummyImagePath);

  // Login
  const loginRes = await request(app)
    .post('/api/users/login')
    .send({ email, password });

  return {
    token: loginRes.body.data.accessToken,
    user: loginRes.body.data.user,
    password
  };
};
