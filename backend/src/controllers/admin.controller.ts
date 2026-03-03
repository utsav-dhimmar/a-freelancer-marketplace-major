import type { NextFunction, Request, Response } from 'express';
import { HTTP_STATUS, TOKEN } from '../constants/index.js';
import type { AuthRequest } from '../middleware/auth.middleware.js';
import { adminService } from '../services/admin.service.js';
import { userService } from '../services/user.service.js';
import { ApiError, ApiResponse } from '../utils/ApiHelper.js';
import asyncHandler from '../utils/asyncHandler.js';
import {
  generateAccessToken,
  generateRefreshToken,
} from '../utils/jwt.util.js';

// ─── Admin Login ─────────────────────────────────────────────────

/**
 * POST /api/admin/login
 * Admin login using credentials from .env
 */
export const adminLogin = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        'Email and password are required',
      );
    }

    // Validate against env credentials
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      throw new ApiError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        'Admin credentials are not configured on the server',
      );
    }

    if (
      email.toLowerCase() !== adminEmail.toLowerCase() ||
      password !== adminPassword
    ) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid admin credentials');
    }

    // Find or create admin user in DB
    const admin = await adminService.findOrCreateAdmin(
      adminEmail,
      adminPassword,
    );

    // Generate tokens
    const userId = String(admin._id);
    const accessToken = generateAccessToken(userId);
    const refreshToken = generateRefreshToken(userId);

    // Save refresh token
    await userService.updateRefreshToken(userId, refreshToken);

    res
      .status(HTTP_STATUS.OK)
      .cookie('accessToken', accessToken, {
        maxAge: TOKEN.ACCESSTOKEN_MAX_AGE,
        httpOnly: true,
        sameSite: 'strict',
      })
      .cookie('refreshToken', refreshToken, {
        maxAge: TOKEN.REFRESHTOKEN_MAX_AGE,
        httpOnly: true,
        sameSite: 'strict',
      })
      .json(
        new ApiResponse(HTTP_STATUS.OK, 'Admin login successful', {
          accessToken,
          refreshToken,
          user: {
            id: admin._id,
            username: admin.username,
            fullname: admin.fullname,
            email: admin.email,
            role: admin.role,
            createdAt: admin.createdAt,
            profilePicture: admin.profilePicture,
          },
        }),
      );
  },
);

// ─── Admin Me ────────────────────────────────────────────────────

/**
 * GET /api/admin/me
 * Get current admin user info
 */
export const adminMe = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated');
    }

    if (req.user.role !== 'admin') {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Admin access required');
    }

    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, 'Admin info retrieved', {
        user: {
          id: req.user._id,
          username: req.user.username,
          fullname: req.user.fullname,
          email: req.user.email,
          role: req.user.role,
          profilePicture: req.user.profilePicture,
          createdAt: req.user.createdAt,
          updatedAt: req.user.updatedAt,
        },
      }),
    );
  },
);

// ─── Admin Logout ────────────────────────────────────────────────

/**
 * POST /api/admin/logout
 * Clear refresh token and logout admin
 */
export const adminLogout = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated');
    }

    const userId = String(req.user._id);
    await userService.updateRefreshToken(userId, null);

    res
      .status(HTTP_STATUS.OK)
      .clearCookie('refreshToken')
      .clearCookie('accessToken')
      .json(new ApiResponse(HTTP_STATUS.OK, 'Admin logout successful', null));
  },
);

// ─── Dashboard ───────────────────────────────────────────────────

/**
 * GET /api/admin
 * Get dashboard statistics
 */
export const getDashboardStats = asyncHandler(
  async (_req: AuthRequest, res: Response, _next: NextFunction) => {
    const stats = await adminService.getDashboardStats();
    res
      .status(HTTP_STATUS.OK)
      .json(
        new ApiResponse(HTTP_STATUS.OK, 'Dashboard stats retrieved', { stats }),
      );
  },
);

// ─── User Management ─────────────────────────────────────────────

/**
 * GET /api/admin/users
 * List all users (paginated, filterable by role & search)
 */
export const getAllUsers = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await adminService.getAllUsers(page, limit);

    res
      .status(HTTP_STATUS.OK)
      .json(new ApiResponse(HTTP_STATUS.OK, 'Users retrieved', result));
  },
);

/**
 * GET /api/admin/users/:id
 * Get a single user by ID
 */
export const getUserById = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const id = req.params.id as string;
    const user = await adminService.getUserById(id);

    if (!user) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
    }

    res
      .status(HTTP_STATUS.OK)
      .json(new ApiResponse(HTTP_STATUS.OK, 'User retrieved', { user }));
  },
);

/**
 * PUT /api/admin/users/:id
 * Update a user (role, profile fields)
 */
export const updateUser = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const id = req.params.id as string;
    const { role, fullname, email, username } = req.body;

    // Validate role if provided
    if (role) {
      const validRoles = ['client', 'admin', 'freelancer'];
      if (!validRoles.includes(role)) {
        throw new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          'Invalid role. Must be client, admin, or freelancer',
        );
      }
    }

    const user = await adminService.updateUser(id, {
      role,
      fullname,
      email,
      username,
    });

    if (!user) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
    }

    res
      .status(HTTP_STATUS.OK)
      .json(
        new ApiResponse(HTTP_STATUS.OK, 'User updated successfully', { user }),
      );
  },
);

/**
 * DELETE /api/admin/users/:id
 * Delete a user account
 */
export const deleteUser = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const id = req.params.id as string;

    // Prevent admin from deleting their own account
    if (req.user && String(req.user._id) === id) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        'Cannot delete your own admin account',
      );
    }

    const user = await adminService.deleteUser(id);

    if (!user) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
    }

    res
      .status(HTTP_STATUS.OK)
      .json(new ApiResponse(HTTP_STATUS.OK, 'User deleted successfully', null));
  },
);

// ─── Job Management ──────────────────────────────────────────────

/**
 * GET /api/admin/jobs
 * List all jobs across all statuses (paginated, filterable)
 */
export const getAllJobs = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as
      | 'open'
      | 'in_progress'
      | 'completed'
      | 'cancelled'
      | undefined;
    const search = req.query.search as string | undefined;

    const result = await adminService.getAllJobs(page, limit, {
      status,
      search,
    });

    res
      .status(HTTP_STATUS.OK)
      .json(new ApiResponse(HTTP_STATUS.OK, 'Jobs retrieved', result));
  },
);

/**
 * DELETE /api/admin/jobs/:id
 * Force delete a job and its proposals
 */
export const deleteJob = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const id = req.params.id as string;
    const job = await adminService.deleteJob(id);

    if (!job) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Job not found');
    }

    res
      .status(HTTP_STATUS.OK)
      .json(new ApiResponse(HTTP_STATUS.OK, 'Job deleted successfully', null));
  },
);

// ─── Contract Management ─────────────────────────────────────────

/**
 * GET /api/admin/contracts
 * List all contracts (paginated, filterable by status)
 */
export const getAllContracts = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as
      | 'active'
      | 'submitted'
      | 'completed'
      | 'disputed'
      | undefined;

    const result = await adminService.getAllContracts(page, limit, { status });

    res
      .status(HTTP_STATUS.OK)
      .json(new ApiResponse(HTTP_STATUS.OK, 'Contracts retrieved', result));
  },
);

/**
 * PATCH /api/admin/contracts/:id/status
 * Admin override contract status
 */
export const updateContractStatus = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const id = req.params.id as string;
    const { status } = req.body;

    const validStatuses = ['active', 'submitted', 'completed', 'disputed'];
    if (!status || !validStatuses.includes(status)) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        'Invalid status. Must be active, submitted, completed, or disputed',
      );
    }

    const contract = await adminService.updateContractStatus(id, status);

    if (!contract) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Contract not found');
    }

    res
      .status(HTTP_STATUS.OK)
      .json(
        new ApiResponse(
          HTTP_STATUS.OK,
          'Contract status updated successfully',
          { contract },
        ),
      );
  },
);

// ─── Review Management ───────────────────────────────────────────

/**
 * GET /api/admin/reviews
 * List all reviews (paginated)
 */
export const getAllReviews = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await adminService.getAllReviews(page, limit);

    res
      .status(HTTP_STATUS.OK)
      .json(new ApiResponse(HTTP_STATUS.OK, 'Reviews retrieved', result));
  },
);

/**
 * DELETE /api/admin/reviews/:id
 * Delete a review
 */
export const deleteReview = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const id = req.params.id as string;
    const review = await adminService.deleteReview(id);

    if (!review) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Review not found');
    }

    res
      .status(HTTP_STATUS.OK)
      .json(
        new ApiResponse(HTTP_STATUS.OK, 'Review deleted successfully', null),
      );
  },
);
