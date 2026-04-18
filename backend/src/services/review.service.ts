import { Types } from 'mongoose';
import { Review, type IReview } from '../model/review.model.js';
import { Contract } from '../model/contracts.model.js';
import { User } from '../model/user.model.js';
import { Freelancer } from '../model/freelancer.model.js';
import type { CreateReviewData } from '../types/review.types.js';

export class ReviewService {
  /**
   * Create a new review.
   * Validates: contract is completed, reviewer is a party, and hasn't already reviewed.
   */
  async createReview(
    reviewerId: string,
    reviewerRole: string,
    data: CreateReviewData,
  ): Promise<IReview> {
    const contract = await Contract.findById(data.contractId);
    if (!contract) {
      throw new Error('CONTRACT_NOT_FOUND');
    }

    if (contract.status === 'disputed') {
      throw new Error('CONTRACT_DISPUTED');
    }

    if (contract.status !== 'completed') {
      throw new Error('CONTRACT_NOT_COMPLETED');
    }

    const isClient = String(contract.client) === reviewerId;
    const isFreelancer = String(contract.freelancer) === reviewerId;

    if (!isClient && !isFreelancer) {
      throw new Error('NOT_CONTRACT_PARTY');
    }

    // Determine reviewee (the other party)
    const revieweeId = isClient
      ? String(contract.freelancer)
      : String(contract.client);

    // targetRole refers to the role of the person being reviewed
    const targetRole = isClient ? 'freelancer' : 'client';

    // Check if already reviewed
    const existing = await Review.findOne({
      reviewer: reviewerId,
      reviewee: revieweeId,
      contract: data.contractId,
    });
    if (existing) {
      throw new Error('ALREADY_REVIEWED');
    }

    const review = new Review({
      reviewer: reviewerId,
      reviewee: revieweeId,
      contract: data.contractId,
      targetRole,
      rating: data.rating,
      comment: data.comment || '',
    });

    await review.save();

    // Trigger aggregate rating update
    await this.updateRevieweeRating(revieweeId, targetRole);

    return review.populate([
      { path: 'reviewer', select: '-password -refreshToken' },
      { path: 'reviewee', select: '-password -refreshToken' },
      { path: 'contract' },
    ]);
  }

  /**
   * Update aggregate rating for a user or freelancer
   */
  private async updateRevieweeRating(
    revieweeId: string,
    targetRole: 'client' | 'freelancer',
  ) {
    // Get all reviews for this reviewee in this role
    const stats = await Review.aggregate([
      {
        $match: {
          reviewee: new Types.ObjectId(revieweeId),
          targetRole,
        },
      },
      {
        $group: {
          _id: '$reviewee',
          averageRating: { $avg: '$rating' },
          reviewCount: { $sum: 1 },
        },
      },
    ]);

    const statsFound = stats.length > 0;
    const averageRating = statsFound ? stats[0].averageRating : 0;
    const reviewCount = statsFound ? stats[0].reviewCount : 0;

    if (targetRole === 'client') {
      await User.findByIdAndUpdate(revieweeId, {
        clientRating: Number(averageRating.toFixed(1)),
        clientReviewCount: reviewCount,
      });
    } else {
      await Freelancer.findOneAndUpdate(
        { user: revieweeId },
        {
          rating: Number(averageRating.toFixed(1)),
          reviewCount: reviewCount,
        },
      );
    }
  }

  /**
   * Get all reviews received by a user
   */
  async getReviewsByUser(userId: string): Promise<IReview[]> {
    return Review.find({ reviewee: userId })
      .populate([
        { path: 'reviewer', select: '-password -refreshToken' },
        { path: 'reviewee', select: '-password -refreshToken' },
        { path: 'contract' },
      ])
      .sort({ createdAt: -1 });
  }

  /**
   * Get reviews for a specific contract
   */
  async getReviewsByContract(contractId: string): Promise<IReview[]> {
    return Review.find({ contract: contractId })
      .populate([
        { path: 'reviewer', select: '-password -refreshToken' },
        { path: 'reviewee', select: '-password -refreshToken' },
        { path: 'contract' },
      ])
      .sort({ createdAt: -1 });
  }

  /**
   * Get a user's review for a specific contract
   */
  async getUserReviewForContract(
    userId: string,
    contractId: string,
  ): Promise<IReview | null> {
    return Review.findOne({
      reviewer: userId,
      contract: contractId,
    });
  }
}

export const reviewService = new ReviewService();
