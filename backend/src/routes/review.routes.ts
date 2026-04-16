import { Router } from 'express';
import {
  createReview,
  getReviewsByContract,
  getReviewsByUser,
  checkReviewed,
} from '../controllers/review.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { createReviewSchema } from '../schemas/review.schema.js';

const router = Router();

/**
 * @route   POST /api/reviews
 * @desc    Create a review for the other party on a completed contract
 * @access  Private
 */
router.post('/', authMiddleware, validate(createReviewSchema), createReview);

/**
 * @route   GET /api/reviews/contract/:contractId
 * @desc    Get all reviews for a specific contract
 * @access  Private
 */
router.get('/contract/:contractId', authMiddleware, getReviewsByContract);

/**
 * @route   GET /api/reviews/user/:userId
 * @desc    Get all reviews received by a user
 * @access  Private
 */
router.get('/user/:userId', authMiddleware, getReviewsByUser);

/**
 * @route   GET /api/reviews/check/:contractId
 * @desc    Check if current user has already reviewed this contract
 * @access  Private
 */
router.get('/check/:contractId', authMiddleware, checkReviewed);

export default router;
