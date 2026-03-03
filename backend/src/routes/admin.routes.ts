import { Router } from 'express';
import {
  adminLogin,
  adminMe,
  adminLogout,
  getDashboardStats,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAllJobs,
  deleteJob,
  getAllContracts,
  updateContractStatus,
  getAllReviews,
  deleteReview,
} from '../controllers/admin.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { adminOnly } from '../middleware/role.middleware.js';

const router = Router();

// ─── Public Admin Routes ─────────────────────────────────────────

/**
 * @route   POST /api/admin/login
 * @desc    Admin login (validates against env credentials)
 * @access  Public
 */
router.post('/login', adminLogin);

// ─── Admin Auth (requires authentication + admin role) ───────

/**
 * @route   GET /api/admin/me
 * @desc    Get current admin user info
 * @access  Private (Admin only)
 */
router.get('/me', authMiddleware, adminOnly, adminMe);

/**
 * @route   POST /api/admin/logout
 * @desc    Admin logout (clear tokens)
 * @access  Private (Admin only)
 */
router.post('/logout', authMiddleware, adminOnly, adminLogout);

// All remaining admin routes require authentication + admin role
router.use(authMiddleware, adminOnly);

// ─── Dashboard ───────────────────────────────────────────────────

/**
 * @route   GET /api/admin
 * @desc    Get dashboard statistics
 * @access  Private (Admin only)
 */
router.get('/', getDashboardStats);

// ─── User Management ─────────────────────────────────────────────

/**
 * @route   GET /api/admin/users
 * @desc    List all users (paginated, filterable)
 * @access  Private (Admin only)
 */
router.get('/users', getAllUsers);

/**
 * @route   GET /api/admin/users/:id
 * @desc    Get user by ID
 * @access  Private (Admin only)
 */
router.get('/users/:id', getUserById);

/**
 * @route   PUT /api/admin/users/:id
 * @desc    Update user (role, profile fields)
 * @access  Private (Admin only)
 */
router.put('/users/:id', updateUser);

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete user account
 * @access  Private (Admin only)
 */
router.delete('/users/:id', deleteUser);

// ─── Job Management ──────────────────────────────────────────────

/**
 * @route   GET /api/admin/jobs
 * @desc    List all jobs (any status, paginated)
 * @access  Private (Admin only)
 */
router.get('/jobs', getAllJobs);

/**
 * @route   DELETE /api/admin/jobs/:id
 * @desc    Force delete a job and its proposals
 * @access  Private (Admin only)
 */
router.delete('/jobs/:id', deleteJob);

// ─── Contract Management ─────────────────────────────────────────

/**
 * @route   GET /api/admin/contracts
 * @desc    List all contracts (paginated, filterable)
 * @access  Private (Admin only)
 */
router.get('/contracts', getAllContracts);

/**
 * @route   PATCH /api/admin/contracts/:id/status
 * @desc    Admin override contract status
 * @access  Private (Admin only)
 */
router.patch('/contracts/:id/status', updateContractStatus);

// ─── Review Management ───────────────────────────────────────────

/**
 * @route   GET /api/admin/reviews
 * @desc    List all reviews (paginated)
 * @access  Private (Admin only)
 */
router.get('/reviews', getAllReviews);

/**
 * @route   DELETE /api/admin/reviews/:id
 * @desc    Delete a review
 * @access  Private (Admin only)
 */
router.delete('/reviews/:id', deleteReview);

export default router;
