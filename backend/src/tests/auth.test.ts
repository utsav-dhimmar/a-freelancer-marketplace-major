import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import path from 'path';
import fs from 'fs';

describe('Auth APIs', () => {
    const testUser = {
        username: 'authuser',
        fullname: 'Auth User',
        email: 'testauth@example.com',
        password: 'password123',
        role: 'client'
    };

    const dummyImagePath = path.join(__dirname, 'test-image.png');

    beforeAll(() => {
        if (!fs.existsSync(dummyImagePath)) {
            fs.writeFileSync(dummyImagePath, 'dummy content');
        }
    });

    it('should register a new user', async () => {
        const res = await request(app)
            .post('/api/users/register')
            .field('username', testUser.username)
            .field('fullname', testUser.fullname)
            .field('email', testUser.email)
            .field('password', testUser.password)
            .field('role', testUser.role)
            .attach('profilePicture', dummyImagePath);

        expect(res.status).toBe(201);
        expect(res.body.data.user).toBeDefined();
        expect(res.body.data.user.email).toBe(testUser.email);
    });

    it('should login the user', async () => {
        // Ensure user exists (DB might have been cleared if running parallel, 
        // but vitest runs sequentially by default for files usually. 
        // However, in our setup we clear in afterEach)
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
                password: testUser.password
            });

        expect(res.status).toBe(200);
        expect(res.body.data.user).toBeDefined();
        expect(res.body.data.accessToken).toBeDefined();
    });

    it('should fail login with wrong password', async () => {
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
                password: 'wrongpassword'
            });

        expect(res.status).toBe(401);
    });
});
