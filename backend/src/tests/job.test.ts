import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { registerAndLogin } from './test.utils.js';

describe('Job APIs', () => {
  let clientToken: string;
  let clientId: string;

  beforeEach(async () => {
    const res = await registerAndLogin('client');
    clientToken = res.token;
    clientId = res.user.id;
  });

  describe('POST /api/jobs', () => {
    it('should create a new job successfully', async () => {
      const jobData = {
        title: 'Need a React Developer',
        description: 'Building a marketplace app using React and Node.js.',
        difficulty: 'intermediate',
        budget: 500,
        budgetType: 'fixed',
        skillsRequired: ['React', 'Node.js', 'TypeScript'],
      };

      const res = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(jobData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.job.title).toBe(jobData.title);
      // Client might be populated or just ID string
      const responseClientId = typeof res.body.data.job.client === 'object' 
        ? res.body.data.job.client._id 
        : res.body.data.job.client;
      expect(responseClientId).toBe(clientId);
    });

    it('should return 400 for invalid job data (short title)', async () => {
      const invalidJob = {
        title: 'Short',
        description: 'Too short title',
        difficulty: 'entry',
        budget: 100,
        budgetType: 'fixed',
      };

      const res = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(invalidJob);

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/jobs', () => {
    it('should retrieve all open jobs', async () => {
      // Create a job first to avoid 404
      await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          title: 'Initial Job for Listing',
          description: 'A job to ensure the list is not empty.',
          difficulty: 'entry',
          budget: 100,
          budgetType: 'fixed',
        });

      const res = await request(app).get('/api/jobs');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.jobs)).toBe(true);
      expect(res.body.data.jobs.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/jobs/:id', () => {
    it('should retrieve job by ID', async () => {
      // Create a job first
      const createRes = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          title: 'Testing Job ID Fetch',
          description: 'A detailed description for testing purposes.',
          difficulty: 'expert',
          budget: 1000,
          budgetType: 'fixed',
          skillsRequired: ['Testing'],
        });

      if (!createRes.body.data) {
        console.log('Create Job failed:', createRes.body);
      }
      const jobId = createRes.body.data.job._id;

      const res = await request(app).get(`/api/jobs/${jobId}`);
      expect(res.status).toBe(200);
      expect(res.body.data.job._id).toBe(jobId);
    });

    it('should return 404 for non-existent job ID', async () => {
      const fakeId = '60d5f1f5f1f5f1f5f1f5f1f5';
      const res = await request(app).get(`/api/jobs/${fakeId}`);
      expect(res.status).toBe(404);
    });
  });
});
