import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { registerAndLogin } from './test.utils.js';

describe('Freelancer APIs', () => {
  let freelancerToken: string;
  let freelancerId: string;

  beforeEach(async () => {
    const res = await registerAndLogin('freelancer');
    freelancerToken = res.token;
    freelancerId = res.user.id;
  });

  describe('POST /api/freelancers', () => {
    it('should create a freelancer profile successfully', async () => {
      const profileData = {
        title: 'Full Stack Developer',
        bio: 'Experienced in MERN stack.',
        skills: ['MongoDB', 'Express', 'React', 'Node.js'],
        hourlyRate: 50,
      };

      const res = await request(app)
        .post('/api/freelancers')
        .set('Authorization', `Bearer ${freelancerToken}`)
        .send(profileData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.freelancer.title).toBe(profileData.title);
    });

    it('should return 400 for missing required fields', async () => {
      const res = await request(app)
        .post('/api/freelancers')
        .set('Authorization', `Bearer ${freelancerToken}`)
        .send({ title: 'Missing Rate' });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/freelancers/me', () => {
    it('should retrieve current freelancer profile', async () => {
      // Create profile first
      await request(app)
        .post('/api/freelancers')
        .set('Authorization', `Bearer ${freelancerToken}`)
        .send({
          title: 'UI/UX Designer',
          bio: 'Designing beautiful interfaces.',
          skills: ['Figma', 'Sketch'],
          hourlyRate: 40,
        });

      const res = await request(app)
        .get('/api/freelancers/me')
        .set('Authorization', `Bearer ${freelancerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.freelancer.title).toBe('UI/UX Designer');
    });
  });
});
