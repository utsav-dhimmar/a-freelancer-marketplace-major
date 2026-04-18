import type { NextFunction, Response } from 'express';
import { HTTP_STATUS } from '../constants/index.js';
import type { AuthRequest } from '../middleware/auth.middleware.js';
import { reviewService } from '../services/review.service.js';
import { ApiError, ApiResponse } from '../utils/ApiHelper.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * POST /api/reviews
 * Create a review for the other party on a completed contract
 */
export const createReview = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated');
    }

    const { contractId, rating, comment } = req.body;

    try {
      const review = await reviewService.createReview(
        String(req.user._id),
        req.user.role,
        { contractId, rating, comment },
      );

      res.status(HTTP_STATUS.CREATED).json(
        new ApiResponse(HTTP_STATUS.CREATED, 'Review submitted successfully', {
          review,
        }),
      );
    } catch (error: any) {
      const errorMap: Record<string, { status: number; message: string }> = {
        CONTRACT_NOT_FOUND: {
          status: HTTP_STATUS.NOT_FOUND,
          message: 'Contract not found',
        },
        CONTRACT_NOT_COMPLETED: {
          status: HTTP_STATUS.BAD_REQUEST,
          message: 'You can only review after the contract is completed',
        },
        CONTRACT_DISPUTED: {
          status: HTTP_STATUS.FORBIDDEN,
          message:
            'Contract is disputed. Please resolve the dispute via chat before leaving a review.',
        },
        NOT_CONTRACT_PARTY: {
          status: HTTP_STATUS.FORBIDDEN,
          message: 'You can only review someone you have worked with',
        },
        ALREADY_REVIEWED: {
          status: HTTP_STATUS.CONFLICT,
          message: 'You have already reviewed this contract',
        },
      };

      const mapped = errorMap[error.message];
      if (mapped) {
        throw new ApiError(mapped.status, mapped.message);
      }
      throw error;
    }
  },
);

/**
 * GET /api/reviews/contract/:contractId
 * Get all reviews for a specific contract
 */
export const getReviewsByContract = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated');
    }

    const contractId = req.params.contractId as string;
    const reviews = await reviewService.getReviewsByContract(contractId);

    res
      .status(HTTP_STATUS.OK)
      .json(new ApiResponse(HTTP_STATUS.OK, 'Reviews retrieved', { reviews }));
  },
);

/**
 * GET /api/reviews/user/:userId
 * Get all reviews received by a specific user
 */
export const getReviewsByUser = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated');
    }

    const userId = req.params.userId as string;
    const reviews = await reviewService.getReviewsByUser(userId);

    res
      .status(HTTP_STATUS.OK)
      .json(new ApiResponse(HTTP_STATUS.OK, 'Reviews retrieved', { reviews }));
  },
);

/**
 * GET /api/reviews/check/:contractId
 * Check if the current user has already reviewed this contract
 */
export const checkReviewed = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated');
    }

    const contractId = req.params.contractId as string;
    const review = await reviewService.getUserReviewForContract(
      String(req.user._id),
      contractId,
    );

    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, 'Review check completed', {
        hasReviewed: !!review,
        review,
      }),
    );
  },
);
