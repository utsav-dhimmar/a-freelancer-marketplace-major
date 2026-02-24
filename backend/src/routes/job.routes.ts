import { Router } from 'express';
import {
  createJob,
  getAllJobs,
  searchJobs,
  getMyJobs,
  getJobById,
  updateJob,
  updateJobStatus,
  deleteJob,
} from '../controllers/job.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

/**
 * @route   GET /api/jobs
 * @desc    Get all open jobs with pagination
 * @access  Public
 */
router.get('/', getAllJobs);

/**
 * @route   GET /api/jobs/search
 * @desc    Search jobs with filters
 * @access  Public
 */
router.get('/search', searchJobs);

/**
 * @route   GET /api/jobs/my-jobs
 * @desc    Get client's posted jobs
 * @access  Private (Client only)
 */
router.get('/my-jobs', authMiddleware, getMyJobs);

/**
 * @route   GET /api/jobs/:id
 * @desc    Get job by ID
 * @access  Public
 */
router.get('/:id', getJobById);

/**
 * @route   POST /api/jobs
 * @desc    Create new job posting
 * @access  Private (Client only)
 */
router.post('/', authMiddleware, createJob);

/**
 * @route   PUT /api/jobs/:id
 * @desc    Update job posting
 * @access  Private (Owner only)
 */
router.put('/:id', authMiddleware, updateJob);

/**
 * @route   PATCH /api/jobs/:id/status
 * @desc    Update job status
 * @access  Private (Owner only)
 */
router.patch('/:id/status', authMiddleware, updateJobStatus);

/**
 * @route   DELETE /api/jobs/:id
 * @desc    Delete job posting
 * @access  Private (Owner only)
 */
router.delete('/:id', authMiddleware, deleteJob);

export default router;
