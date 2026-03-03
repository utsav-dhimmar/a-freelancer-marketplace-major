import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { registerAndLogin } from './test.utils.js';

describe('Proposal APIs', () => {
  let clientToken: string;
  let freelancerToken: string;
  let jobId: string;

  beforeEach(async () => {
    // 1. Create client and job
    const client = await registerAndLogin('client');
    clientToken = client.token;

    const jobRes = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        title: 'Job for Proposal Testing',
        description: 'Need someone to help with proposal tests.',
        difficulty: 'entry',
        budget: 100,
        budgetType: 'fixed',
      });
    
    jobId = jobRes.body.data.job._id;

    // 2. Create freelancer
    const freelancer = await registerAndLogin('freelancer');
    freelancerToken = freelancer.token;
  });

  describe('POST /api/proposals', () => {
    it('should submit a proposal successfully', async () => {
      const proposalData = {
        job: jobId,
        coverLetter: 'I am perfect for this job because I have done this before.',
        bidAmount: 90,
        estimatedTime: '2 days',
      };

      const res = await request(app)
        .post('/api/proposals')
        .set('Authorization', `Bearer ${freelancerToken}`)
        .send(proposalData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      // Proposal job might be populated
      const responseJobId = typeof res.body.data.proposal.job === 'object'
        ? res.body.data.proposal.job._id
        : res.body.data.proposal.job;
      expect(responseJobId).toBe(jobId);
    });
  });

  describe('GET /api/proposals/my-proposals', () => {
    it('should retrieve freelancer proposals', async () => {
      // Submit proposal first
      await request(app)
        .post('/api/proposals')
        .set('Authorization', `Bearer ${freelancerToken}`)
        .send({
          job: jobId,
          coverLetter: 'I am perfect for this job because I have done this before.',
          bidAmount: 90,
          estimatedTime: '2 days',
        });

      const res = await request(app)
        .get('/api/proposals/my-proposals')
        .set('Authorization', `Bearer ${freelancerToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.proposals)).toBe(true);
      expect(res.body.data.proposals.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/proposals/job/:jobid', () => {
    it('should retrieve proposals for a job as client', async () => {
      // Submit proposal first
      await request(app)
        .post('/api/proposals')
        .set('Authorization', `Bearer ${freelancerToken}`)
        .send({
          job: jobId,
          coverLetter: 'I am perfect for this job because I have done this before.',
          bidAmount: 90,
          estimatedTime: '2 days',
        });

      const res = await request(app)
        .get(`/api/proposals/job/${jobId}`)
        .set('Authorization', `Bearer ${clientToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.proposals)).toBe(true);
    });
  });
});
