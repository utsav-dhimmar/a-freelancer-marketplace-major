import { Router } from 'express';
import {
  createFreelancer,
  getMyFreelancerProfile,
  getFreelancerById,
  getAllFreelancers,
  searchFreelancers,
  updateFreelancer,
  deleteFreelancer,
  addPortfolioItem,
  removePortfolioItem,
} from '../controllers/freelancer.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

/**
 * @route   GET /api/freelancers
 * @desc    Get all freelancers with pagination
 * @access  Public
 */
router.get('/', getAllFreelancers);

/**
 * @route   GET /api/freelancers/search
 * @desc    Search freelancers by skills
 * @access  Public
 */
router.get('/search', searchFreelancers);

/**
 * @route   GET /api/freelancers/me
 * @desc    Get current user's freelancer profile
 * @access  Private
 */
router.get('/me', authMiddleware, getMyFreelancerProfile);

/**
 * @route   GET /api/freelancers/:id
 * @desc    Get freelancer by ID
 * @access  Public
 */
router.get('/:id', getFreelancerById);

/**
 * @route   POST /api/freelancers
 * @desc    Create freelancer profile
 * @access  Private (Freelancer role only)
 */
router.post('/', authMiddleware, createFreelancer);

/**
 * @route   PUT /api/freelancers
 * @desc    Update freelancer profile
 * @access  Private
 */
router.put('/', authMiddleware, updateFreelancer);

/**
 * @route   DELETE /api/freelancers
 * @desc    Delete freelancer profile
 * @access  Private
 */
router.delete('/', authMiddleware, deleteFreelancer);

/**
 * @route   POST /api/freelancers/portfolio
 * @desc    Add portfolio item
 * @access  Private
 */
router.post('/portfolio', authMiddleware, addPortfolioItem);

/**
 * @route   DELETE /api/freelancers/portfolio/:index
 * @desc    Remove portfolio item by index
 * @access  Private
 */
router.delete('/portfolio/:index', authMiddleware, removePortfolioItem);

export default router;
