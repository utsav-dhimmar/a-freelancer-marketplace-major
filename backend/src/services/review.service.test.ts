import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Types } from 'mongoose';
import { Review } from '../model/review.model.js';
import { Contract } from '../model/contracts.model.js';
import { User } from '../model/user.model.js';
import { Freelancer } from '../model/freelancer.model.js';
import { ReviewService } from './review.service.js';

vi.mock('../model/review.model.js', () => {
  const MockReview = vi.fn().mockImplementation(function (data) {
    Object.assign(this, data);
    this.save = vi.fn().mockImplementation(function () {
      return Promise.resolve(this);
    });
    this.populate = vi.fn().mockImplementation(function () {
      return Promise.resolve(this);
    });
  });

  (MockReview as any).find = vi.fn();
  (MockReview as any).findOne = vi.fn();
  (MockReview as any).aggregate = vi.fn();

  return { Review: MockReview };
});

vi.mock('../model/contracts.model.js', () => ({
  Contract: {
    findById: vi.fn(),
  },
}));

vi.mock('../model/user.model.js', () => ({
  User: {
    findById: vi.fn(),
    findByIdAndUpdate: vi.fn(),
  },
}));

vi.mock('mongoose', async () => {
  const actual = (await vi.importActual('mongoose')) as any;
  return {
    ...actual,
    Types: {
      ObjectId: vi.fn().mockImplementation(function (id: any) {
        return id;
      }),
    },
  };
});

vi.mock('../model/freelancer.model.js', () => ({
  Freelancer: {
    findOneAndUpdate: vi.fn(),
  },
}));

describe('ReviewService', () => {
  let reviewService: ReviewService;

  beforeEach(() => {
    vi.clearAllMocks();
    reviewService = new ReviewService();
  });

  describe('createReview', () => {
    const mockContract = {
      _id: 'contract-123',
      client: 'client-123',
      freelancer: 'freelancer-user-123',
      status: 'completed',
    };

    it('should successfully create a review for a freelancer (from client)', async () => {
      vi.mocked(Contract.findById).mockResolvedValue(mockContract as any);
      vi.mocked(Review.findOne).mockResolvedValue(null);
      vi.mocked(Review.aggregate).mockResolvedValue([
        { averageRating: 4.5, reviewCount: 10 },
      ]);

      const result = await reviewService.createReview('client-123', 'client', {
        contractId: 'contract-123',
        rating: 5,
        comment: 'Great work!',
      });

      expect(Contract.findById).toHaveBeenCalledWith('contract-123');
      expect(Review.findOne).toHaveBeenCalled();
      expect(Freelancer.findOneAndUpdate).toHaveBeenCalledWith(
        { user: 'freelancer-user-123' },
        { rating: 4.5, reviewCount: 10 },
      );
      expect(result).toBeDefined();
    });

    it('should successfully create a review for a client (from freelancer)', async () => {
      vi.mocked(Contract.findById).mockResolvedValue(mockContract as any);
      vi.mocked(Review.findOne).mockResolvedValue(null);
      vi.mocked(Review.aggregate).mockResolvedValue([
        { averageRating: 4.0, reviewCount: 5 },
      ]);

      const result = await reviewService.createReview(
        'freelancer-user-123',
        'freelancer',
        {
          contractId: 'contract-123',
          rating: 4,
          comment: 'Good client',
        },
      );

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith('client-123', {
        clientRating: 4.0,
        clientReviewCount: 5,
      });
      expect(result).toBeDefined();
    });

    it('should reset ratings to 0 if no reviews are found (e.g. after deletion)', async () => {
      vi.mocked(Contract.findById).mockResolvedValue(mockContract as any);
      vi.mocked(Review.findOne).mockResolvedValue(null);
      vi.mocked(Review.aggregate).mockResolvedValue([]); // No reviews found

      await reviewService.createReview('client-123', 'client', {
        contractId: 'contract-123',
        rating: 5,
        comment: 'Great work!',
      });

      expect(Freelancer.findOneAndUpdate).toHaveBeenCalledWith(
        { user: 'freelancer-user-123' },
        { rating: 0, reviewCount: 0 },
      );
    });

    it('should throw error if contract is not found', async () => {
      vi.mocked(Contract.findById).mockResolvedValue(null);

      await expect(
        reviewService.createReview('client-123', 'client', {
          contractId: 'invalid-id',
          rating: 5,
        }),
      ).rejects.toThrow('CONTRACT_NOT_FOUND');
    });

    it('should throw error if contract is disputed', async () => {
      vi.mocked(Contract.findById).mockResolvedValue({
        ...mockContract,
        status: 'disputed',
      } as any);

      await expect(
        reviewService.createReview('client-123', 'client', {
          contractId: 'contract-123',
          rating: 5,
        }),
      ).rejects.toThrow('CONTRACT_DISPUTED');
    });

    it('should throw error if contract is not completed', async () => {
      vi.mocked(Contract.findById).mockResolvedValue({
        ...mockContract,
        status: 'active',
      } as any);

      await expect(
        reviewService.createReview('client-123', 'client', {
          contractId: 'contract-123',
          rating: 5,
        }),
      ).rejects.toThrow('CONTRACT_NOT_COMPLETED');
    });

    it('should throw error if reviewer is not a party to the contract', async () => {
      vi.mocked(Contract.findById).mockResolvedValue(mockContract as any);

      await expect(
        reviewService.createReview('random-user-id', 'client', {
          contractId: 'contract-123',
          rating: 5,
        }),
      ).rejects.toThrow('NOT_CONTRACT_PARTY');
    });

    it('should throw error if already reviewed', async () => {
      vi.mocked(Contract.findById).mockResolvedValue(mockContract as any);
      vi.mocked(Review.findOne).mockResolvedValue({ _id: 'existing-review' } as any);

      await expect(
        reviewService.createReview('client-123', 'client', {
          contractId: 'contract-123',
          rating: 5,
        }),
      ).rejects.toThrow('ALREADY_REVIEWED');
    });
  });

  describe('getReviewsByUser', () => {
    it('should fetch reviews for a user', async () => {
      const mockQuery = {
        populate: vi.fn().mockReturnThis(),
        sort: vi.fn().mockResolvedValue([{ rating: 5 }]),
      };
      vi.mocked(Review.find).mockReturnValue(mockQuery as any);

      const result = await reviewService.getReviewsByUser('user-123');

      expect(Review.find).toHaveBeenCalledWith({ reviewee: 'user-123' });
      expect(result).toHaveLength(1);
    });
  });

  describe('getUserReviewForContract', () => {
    it('should return the review for a specific reviewer and contract', async () => {
      const mockReview = { _id: 'review-123', rating: 5 };
      vi.mocked(Review.findOne).mockResolvedValue(mockReview as any);

      const result = await reviewService.getUserReviewForContract(
        'user-123',
        'contract-123',
      );

      expect(Review.findOne).toHaveBeenCalledWith({
        reviewer: 'user-123',
        contract: 'contract-123',
      });
      expect(result).toEqual(mockReview);
    });

    it('should return null if no review is found', async () => {
      vi.mocked(Review.findOne).mockResolvedValue(null);

      const result = await reviewService.getUserReviewForContract(
        'user-123',
        'contract-123',
      );

      expect(result).toBeNull();
    });
  });
});
