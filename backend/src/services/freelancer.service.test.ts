import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Freelancer } from '../model/freelancer.model.js';
import { FreelancerService } from './freelancer.service.js';

vi.mock('../model/freelancer.model.js', () => ({
  Freelancer: {
    findOne: vi.fn(),
    findById: vi.fn(),
    findOneAndUpdate: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    findOneAndDelete: vi.fn(),
    countDocuments: vi.fn(),
    find: vi.fn(),
  },
}));

describe('FreelancerService', () => {
  let freelancerService: FreelancerService;

  beforeEach(() => {
    vi.clearAllMocks();
    freelancerService = new FreelancerService();
  });

  describe('findByUserId', () => {
    it('should find freelancer by userId and populate user data', async () => {
      const userId = 'user-123';
      const mockFreelancer = { user: userId };
      const mockQuery = {
        populate: vi.fn().mockResolvedValue(mockFreelancer),
      };
      vi.mocked(Freelancer.findOne).mockReturnValue(mockQuery as any);

      const result = await freelancerService.findByUserId(userId);

      expect(Freelancer.findOne).toHaveBeenCalledWith({ user: userId });
      expect(mockQuery.populate).toHaveBeenCalledWith('user', '-password -refreshToken');
      expect(result).toEqual(mockFreelancer);
    });
  });

  describe('findById', () => {
    it('should find freelancer and populate user', async () => {
      const id = 'freelancer-123';
      const mockQuery = {
        populate: vi.fn().mockResolvedValue({ _id: id }),
      };
      vi.mocked(Freelancer.findById).mockReturnValue(mockQuery as any);
      const result = await freelancerService.findById(id);
      expect(Freelancer.findById).toHaveBeenCalledWith(id);
      expect(mockQuery.populate).toHaveBeenCalled();
      expect(result?._id).toBe(id);
    });
  });

  describe('updateFreelancer', () => {
    it('should update freelancer and return populated result', async () => {
      const userId = 'user-123';
      const data = { bio: 'New Bio' };
      const mockQuery = {
        populate: vi.fn().mockResolvedValue({ user: userId, bio: 'New Bio' }),
      };
      vi.mocked(Freelancer.findOneAndUpdate).mockReturnValue(mockQuery as any);
      const result = await freelancerService.updateFreelancer(userId, data as any);
      expect(Freelancer.findOneAndUpdate).toHaveBeenCalledWith(
        { user: userId },
        { $set: data },
        { new: true }
      );
      expect(result?.bio).toBe('New Bio');
    });
  });

  describe('deleteFreelancer', () => {
    it('should delete freelancer by userId', async () => {
      const userId = 'user-123';
      vi.mocked(Freelancer.findOneAndDelete).mockResolvedValue({ user: userId });
      const result = await freelancerService.deleteFreelancer(userId);
      expect(Freelancer.findOneAndDelete).toHaveBeenCalledWith({ user: userId });
      expect(result).toBeDefined();
    });
  });

  describe('profileExists', () => {
    it('should return true if profile exists', async () => {
      vi.mocked(Freelancer.findOne).mockResolvedValue({ _id: 'freelancer-123' });
      const exists = await freelancerService.profileExists('user-123');
      expect(exists).toBe(true);
    });

    it('should return false if profile does not exist', async () => {
      vi.mocked(Freelancer.findOne).mockResolvedValue(null);
      const exists = await freelancerService.profileExists('user-123');
      expect(exists).toBe(false);
    });
  });

  describe('addPortfolioItem', () => {
    it('should push a new portfolio item and return populated freelancer', async () => {
      const userId = 'user-123';
      const item = { title: 'New Project', description: 'Desc', skills: ['TS'] };
      const mockQuery = {
        populate: vi.fn().mockResolvedValue({ user: userId, portfolio: [item] }),
      };
      vi.mocked(Freelancer.findOneAndUpdate).mockReturnValue(mockQuery as any);

      const result = await freelancerService.addPortfolioItem(userId, item as any);

      expect(Freelancer.findOneAndUpdate).toHaveBeenCalledWith(
        { user: userId },
        { $push: { portfolio: item } },
        { new: true }
      );
      expect(result?.portfolio[0].title).toBe('New Project');
    });
  });

  describe('removePortfolioItem', () => {
    it('should remove portfolio item by index', async () => {
      const userId = 'user-123';
      const mockFreelancer = {
        portfolio: [{ title: 'Item 1' }, { title: 'Item 2' }],
        save: vi.fn().mockResolvedValue(true),
        populate: vi.fn().mockResolvedValue({ portfolio: [{ title: 'Item 2' }] }),
      };
      vi.mocked(Freelancer.findOne).mockResolvedValue(mockFreelancer);

      const result = await freelancerService.removePortfolioItem(userId, 0);

      expect(mockFreelancer.portfolio.length).toBe(1);
      expect(mockFreelancer.save).toHaveBeenCalled();
      expect(result?.portfolio[0].title).toBe('Item 2');
    });

    it('should return null if index is out of bounds', async () => {
      const mockFreelancer = { portfolio: [] };
      vi.mocked(Freelancer.findOne).mockResolvedValue(mockFreelancer);
      const result = await freelancerService.removePortfolioItem('123', 0);
      expect(result).toBeNull();
    });
  });

  describe('updateRating', () => {
    it('should update freelancer rating', async () => {
      const id = '123';
      vi.mocked(Freelancer.findByIdAndUpdate).mockResolvedValue({ _id: id, rating: 5 });
      const result = await freelancerService.updateRating(id, 5);
      expect(Freelancer.findByIdAndUpdate).toHaveBeenCalledWith(id, { rating: 5 }, { new: true });
      expect(result?.rating).toBe(5);
    });
  });

  describe('incrementTotalJobs', () => {
    it('should increment total jobs count', async () => {
      const id = '123';
      vi.mocked(Freelancer.findByIdAndUpdate).mockResolvedValue({ _id: id, totalJobs: 1 });
      const result = await freelancerService.incrementTotalJobs(id);
      expect(Freelancer.findByIdAndUpdate).toHaveBeenCalledWith(id, { $inc: { totalJobs: 1 } }, { new: true });
      expect(result?.totalJobs).toBe(1);
    });
  });
});
