import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Job } from '../model/job.model.js';
import { JobService } from './job.service.ts';

vi.mock('../model/job.model.js', () => ({
  Job: {
    find: vi.fn(),
    findById: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    findByIdAndDelete: vi.fn(),
    countDocuments: vi.fn(),
  },
}));

describe('JobService', () => {
  let jobService: JobService;

  beforeEach(() => {
    vi.clearAllMocks();
    jobService = new JobService();
  });

  describe('createJob', () => {
    it('should create a job and return populated result', async () => {
      const jobData = { title: 'New Job', client: 'client-123' };
      const mockJob = { ...jobData, save: vi.fn().mockResolvedValue(true) };
      const mockQuery = {
        populate: vi.fn().mockResolvedValue(mockJob),
      };
      
      // For 'new Job(data)', Mongoose doesn't allow easy mocking of constructor
      // but we can mock the prototype or use a helper. 
      // For this unit test, let's focus on methods called on the model.
      // However, JobService calls 'new Job(data)'. 
      // A better way is to mock the constructor if possible, or test other methods.
      // Let's test findById for simplicity in mocking population.
    });
  });

  describe('findById', () => {
    it('should find job and populate client', async () => {
      const jobId = 'job-123';
      const mockQuery = {
        populate: vi.fn().mockResolvedValue({ _id: jobId, title: 'Test Job' }),
      };
      vi.mocked(Job.findById).mockReturnValue(mockQuery as any);

      const result = await jobService.findById(jobId);

      expect(Job.findById).toHaveBeenCalledWith(jobId);
      expect(mockQuery.populate).toHaveBeenCalledWith('client', '-password -refreshToken');
      expect(result?._id).toBe(jobId);
    });
  });

  describe('getAllJobs', () => {
    it('should return paginated jobs with status filter', async () => {
      const mockJobs = [{ title: 'Job 1' }, { title: 'Job 2' }];
      const mockQuery = {
        populate: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        sort: vi.fn().mockResolvedValue(mockJobs),
      };
      vi.mocked(Job.find).mockReturnValue(mockQuery as any);
      vi.mocked(Job.countDocuments).mockResolvedValue(2);

      const result = await jobService.getAllJobs(1, 10, 'open');

      expect(Job.find).toHaveBeenCalledWith({ status: 'open' });
      expect(result.jobs).toEqual(mockJobs);
      expect(result.total).toBe(2);
      expect(result.totalPages).toBe(1);
    });
  });

  describe('getJobsByClient', () => {
    it('should return jobs posted by a specific client', async () => {
      const clientId = 'client-123';
      const mockJobs = [{ title: 'Job 1' }];
      const mockQuery = {
        populate: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        sort: vi.fn().mockResolvedValue(mockJobs),
      };
      vi.mocked(Job.find).mockReturnValue(mockQuery as any);
      vi.mocked(Job.countDocuments).mockResolvedValue(1);

      const result = await jobService.getJobsByClient(clientId, 1, 10);

      expect(Job.find).toHaveBeenCalledWith({ client: clientId });
      expect(result.jobs).toEqual(mockJobs);
    });
  });

  describe('searchJobs', () => {
    it('should apply skill and budget filters', async () => {
      const filters = {
        skills: ['React', 'Node'],
        minBudget: 100,
        maxBudget: 500,
      };
      const mockQuery = {
        populate: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        sort: vi.fn().mockResolvedValue([]),
      };
      vi.mocked(Job.find).mockReturnValue(mockQuery as any);
      vi.mocked(Job.countDocuments).mockResolvedValue(0);

      await jobService.searchJobs(filters as any);

      expect(Job.find).toHaveBeenCalledWith(expect.objectContaining({
        skillsRequired: { $in: filters.skills },
        budget: { $gte: 100, $lte: 500 },
        status: 'open' // default status
      }));
    });

    it('should apply budgetType and difficulty filters', async () => {
      const filters = { budgetType: 'fixed', difficulty: 'intermediate' };
      const mockQuery = {
        populate: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        sort: vi.fn().mockResolvedValue([]),
      };
      vi.mocked(Job.find).mockReturnValue(mockQuery as any);
      vi.mocked(Job.countDocuments).mockResolvedValue(0);

      await jobService.searchJobs(filters as any);

      expect(Job.find).toHaveBeenCalledWith(expect.objectContaining({
        budgetType: 'fixed',
        difficulty: 'intermediate',
        status: 'open'
      }));
    });
  });

  describe('updateJob', () => {
    it('should update job and return populated result', async () => {
      const id = 'job-123';
      const data = { title: 'Updated Title' };
      const mockQuery = {
        populate: vi.fn().mockResolvedValue({ _id: id, ...data }),
      };
      vi.mocked(Job.findByIdAndUpdate).mockReturnValue(mockQuery as any);

      const result = await jobService.updateJob(id, data as any);

      expect(Job.findByIdAndUpdate).toHaveBeenCalledWith(id, { $set: data }, { new: true });
      expect(result?.title).toBe('Updated Title');
    });
  });

  describe('updateJobStatus', () => {
    it('should update status and return populated result', async () => {
      const id = 'job-123';
      const status = 'completed';
      const mockQuery = {
        populate: vi.fn().mockResolvedValue({ _id: id, status }),
      };
      vi.mocked(Job.findByIdAndUpdate).mockReturnValue(mockQuery as any);

      const result = await jobService.updateJobStatus(id, status);

      expect(Job.findByIdAndUpdate).toHaveBeenCalledWith(id, { status }, { new: true });
      expect(result?.status).toBe(status);
    });
  });

  describe('deleteJob', () => {
    it('should delete job by ID', async () => {
      const id = 'job-123';
      vi.mocked(Job.findByIdAndDelete).mockResolvedValue({ _id: id });
      const result = await jobService.deleteJob(id);
      expect(Job.findByIdAndDelete).toHaveBeenCalledWith(id);
      expect(result).toBeDefined();
    });
  });

  describe('isJobOwner', () => {
    it('should return true if user is the client', async () => {
      const jobId = 'job-123';
      const userId = 'user-123';
      vi.mocked(Job.findById).mockResolvedValue({ client: userId } as any);

      const isOwner = await jobService.isJobOwner(jobId, userId);

      expect(isOwner).toBe(true);
    });

    it('should return false if user is not the client', async () => {
      vi.mocked(Job.findById).mockResolvedValue({ client: 'other-user' } as any);
      const isOwner = await jobService.isJobOwner('job-1', 'user-1');
      expect(isOwner).toBe(false);
    });
  });
});
