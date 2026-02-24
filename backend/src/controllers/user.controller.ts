import type { NextFunction, Request, Response } from 'express';
import { HTTP_STATUS, TOKEN } from '../constants/index.js';
import type { AuthRequest } from '../middleware/auth.middleware.js';
import { userService } from '../services/user.service.js';
import { emailService } from '../services/email.service.js';
import { ApiError, ApiResponse } from '../utils/ApiHelper.js';
import asyncHandler from '../utils/asyncHandler.js';

import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt.util.js';

/**
 * POST /api/users/register
 * Register a new user with optional profile picture
 */
export const register = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { username, fullname, email, password, role } = req.body;

    // Validate required fields
    if (!username || !fullname || !email || !password) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        'All fields are required (username, fullname, email, password)',
      );
    }

    // Validate role if provided
    const validRoles = ['client', 'admin', 'freelancer'];
    const userRole = role || 'client';
    if (!validRoles.includes(userRole)) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        'Invalid role. Must be client, admin, or freelancer',
      );
    }

    // Check if email already exists
    if (await userService.emailExists(email)) {
      throw new ApiError(HTTP_STATUS.CONFLICT, 'Email already registered');
    }

    // Check if username already exists
    if (await userService.usernameExists(username)) {
      throw new ApiError(HTTP_STATUS.CONFLICT, 'Username already taken');
    }

    // Validate profile picture is provided
    if (!req.file) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        'Profile picture is required',
      );
    }

    // Build profile picture path
    const profilePicture = `/profiles/${req.file.filename}`;

    // Create user with role and profile picture
    const user = await userService.createUser({
      username,
      fullname,
      email,
      password,
      role: userRole,
      profilePicture,
    });

    // Generate tokens
    const userId = String(user._id);
    const accessToken = generateAccessToken(userId);
    const refreshToken = generateRefreshToken(userId);

    // Save refresh token
    await userService.updateRefreshToken(userId, refreshToken);

    // Send welcome email asynchronously
    emailService.sendWelcomeEmail(user.email, user.username, user.fullname);

    res.status(HTTP_STATUS.CREATED).json(
      new ApiResponse(HTTP_STATUS.CREATED, 'User registered successfully', {
        user: {
          id: user._id,
          username: user.username,
          fullname: user.fullname,
          email: user.email,
          role: user.role,
          profilePicture: user.profilePicture,
          createdAt: user.createdAt,
        },
        accessToken,
        refreshToken,
      }),
    );
  },
);

/**
 * POST /api/users/login
 * Authenticate user and return tokens
 */
export const login = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        'Email and password are required',
      );
    }

    // Find user by email
    const user = await userService.findByEmail(email);
    if (!user) {
      throw new ApiError(
        HTTP_STATUS.UNAUTHORIZED,
        'User with this email not found',
      );
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new ApiError(
        HTTP_STATUS.UNAUTHORIZED,
        'The password you entered is incorrect. Please try again',
      );
    }

    // Generate tokens
    const userId = String(user._id);
    const accessToken = generateAccessToken(userId);
    const refreshToken = generateRefreshToken(userId);

    // Save refresh token
    await userService.updateRefreshToken(userId, refreshToken);

    res
      .status(HTTP_STATUS.OK)
      .cookie('accessToken', accessToken, {
        maxAge: TOKEN.ACCESSTOKEN_MAX_AGE,
        httpOnly: true,
      })
      .cookie('refreshToken', refreshToken, {
        maxAge: TOKEN.REFRESHTOKEN_MAX_AGE,
        httpOnly: true,
      })
      .json(
        new ApiResponse(HTTP_STATUS.OK, 'Login successful', {
          user: {
            id: user._id,
            username: user.username,
            fullname: user.fullname,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            profilePicture: user?.profilePicture,
          },
          accessToken,
          refreshToken,
        }),
      );
  },
);

/**
 * GET /api/users/me
 * Get current authenticated user info
 */
export const me = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated');
    }

    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, 'User info retrieved', {
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

/**
 * POST /api/users/logout
 * Clear refresh token and logout user
 */
export const logout = asyncHandler(
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
      .json(new ApiResponse(HTTP_STATUS.OK, 'Logout successful', null));
  },
);

/**
 * POST /api/users/refresh-token
 * Generate new access token using refresh token
 */
export const refreshTokenHandler = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Refresh token is required');
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      throw new ApiError(
        HTTP_STATUS.UNAUTHORIZED,
        'Invalid or expired refresh token',
      );
    }

    // Find user with this refresh token
    const user = await userService.findByRefreshToken(refreshToken);
    if (!user) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid refresh token');
    }

    // Generate new access token
    const userId = String(user._id);
    const newAccessToken = generateAccessToken(userId);

    res
      .status(HTTP_STATUS.OK)
      .cookie('accessToken', newAccessToken, {
        maxAge: TOKEN.ACCESSTOKEN_MAX_AGE,
      })
      .cookie('refreshToken', refreshToken, {
        maxAge: TOKEN.REFRESHTOKEN_MAX_AGE,
      })
      .json(
        new ApiResponse(HTTP_STATUS.OK, 'Token refreshed successfully', {
          accessToken: newAccessToken,
        }),
      );
  },
);

/**
 * POST /api/users/profile-picture
 * Upload profile picture for authenticated user
 */
export const updateProfilePicture = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated');
    }

    if (!req.file) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        'Profile picture file is required',
      );
    }

    // Build the profile picture URL path
    const profilePicturePath = `/profiles/${req.file.filename}`;

    // Update user's profile picture in database
    const userId = String(req.user._id);
    const updatedUser = await userService.updateProfilePicture(
      userId,
      profilePicturePath,
    );

    if (!updatedUser) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
    }

    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, 'Profile picture updated successfully', {
        user: {
          id: updatedUser._id,
          username: updatedUser.username,
          fullname: updatedUser.fullname,
          email: updatedUser.email,
          role: updatedUser.role,
          profilePicture: updatedUser.profilePicture,
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updatedAt,
        },
      }),
    );
  },
);
