import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('App APIs', () => {
    it('should return welcome message for GET /', async () => {
        const res = await request(app).get('/');
        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Welcome to the Freelancer Marketplace API');
    });

    it('should return 404 for unknown route', async () => {
        const res = await request(app).get('/api/unknown');
        expect(res.status).toBe(404);
    });
});
