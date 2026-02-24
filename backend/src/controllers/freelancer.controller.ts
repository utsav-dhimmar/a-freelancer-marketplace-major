import type { NextFunction, Request, Response } from 'express';
import { HTTP_STATUS } from '../constants/index.js';
import type { AuthRequest } from '../middleware/auth.middleware.js';
import { freelancerService } from '../services/freelancer.service.js';
import { ApiError, ApiResponse } from '../utils/ApiHelper.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * POST /api/freelancers
 * Create freelancer profile for authenticated user
 */
export const createFreelancer = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated');
    }

    // Check if user already has a freelancer profile
    if (await freelancerService.profileExists(String(req.user._id))) {
      throw new ApiError(
        HTTP_STATUS.CONFLICT,
        'Freelancer profile already exists',
      );
    }

    // Check user role - only freelancer role can create profile
    if (req.user.role !== 'freelancer') {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        'Only users with freelancer role can create a freelancer profile',
      );
    }

    const { title, bio, skills, hourlyRate, portfolio } = req.body;

    // Validate required fields
    if (!title || hourlyRate === undefined) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        'Title and hourly rate are required',
      );
    }

    const freelancer = await freelancerService.createFreelancer({
      user: String(req.user._id),
      title,
      bio,
      skills,
      hourlyRate,
      portfolio,
    });

    res.status(HTTP_STATUS.CREATED).json(
      new ApiResponse(
        HTTP_STATUS.CREATED,
        'Freelancer profile created successfully',
        {
          freelancer,
        },
      ),
    );
  },
);

/**
 * GET /api/freelancers/me
 * Get current user's freelancer profile
 */
export const getMyFreelancerProfile = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated');
    }

    const freelancer = await freelancerService.findByUserId(
      String(req.user._id),
    );
    if (!freelancer) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Freelancer profile not found');
    }

    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, 'Freelancer profile retrieved', {
        freelancer,
      }),
    );
  },
);

/**
 * GET /api/freelancers/:id
 * Get freelancer profile by ID
 */
export const getFreelancerById = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;

    if (!id) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Freelancer ID is required');
    }

    const freelancer = await freelancerService.findById(id as string);
    if (!freelancer) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Freelancer not found');
    }

    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, 'Freelancer retrieved', {
        freelancer,
      }),
    );
  },
);

/**
 * GET /api/freelancers
 * Get all freelancers with pagination
 */
export const getAllFreelancers = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await freelancerService.getAllFreelancers(page, limit);
    if (!result.freelancers || result.freelancers.length == 0) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Freelancers not found');
    }
    res
      .status(HTTP_STATUS.OK)
      .json(new ApiResponse(HTTP_STATUS.OK, 'Freelancers retrieved', result));
  },
);

/**
 * GET /api/freelancers/search
 * Search freelancers by skills
 */
export const searchFreelancers = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { skills } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!skills) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        'Skills query parameter is required',
      );
    }

    const skillsArray = (skills as string).split(',').map((s) => s.trim());
    const result = await freelancerService.searchBySkills(
      skillsArray,
      page,
      limit,
    );
    if (!result.freelancers || result.freelancers.length == 0) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Freelancers not found');
    }
    res
      .status(HTTP_STATUS.OK)
      .json(new ApiResponse(HTTP_STATUS.OK, 'Search results', result));
  },
);

/**
 * PUT /api/freelancers
 * Update freelancer profile
 */
export const updateFreelancer = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated');
    }

    const { title, bio, skills, hourlyRate, portfolio } = req.body;

    const freelancer = await freelancerService.updateFreelancer(
      String(req.user._id),
      {
        title,
        bio,
        skills,
        hourlyRate,
        portfolio,
      },
    );

    if (!freelancer) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Freelancer profile not found');
    }

    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, 'Freelancer profile updated', {
        freelancer,
      }),
    );
  },
);

/**
 * DELETE /api/freelancers
 * Delete freelancer profile
 */
export const deleteFreelancer = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated');
    }

    const freelancer = await freelancerService.deleteFreelancer(
      String(req.user._id),
    );
    if (!freelancer) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Freelancer profile not found');
    }

    res
      .status(HTTP_STATUS.OK)
      .json(
        new ApiResponse(HTTP_STATUS.OK, 'Freelancer profile deleted', null),
      );
  },
);

/**
 * POST /api/freelancers/portfolio
 * Add portfolio item
 */
export const addPortfolioItem = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated');
    }

    const { title, link, desc } = req.body;

    if (!title || !link) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        'Title and link are required',
      );
    }

    const freelancer = await freelancerService.addPortfolioItem(
      String(req.user._id),
      {
        title,
        link,
        desc,
      },
    );

    if (!freelancer) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Freelancer profile not found');
    }

    res.status(HTTP_STATUS.CREATED).json(
      new ApiResponse(HTTP_STATUS.CREATED, 'Portfolio item added', {
        freelancer,
      }),
    );
  },
);

/**
 * DELETE /api/freelancers/portfolio/:index
 * Remove portfolio item by index
 */
export const removePortfolioItem = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated');
    }

    const index = parseInt(req.params.index as string);
    if (isNaN(index)) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        'Valid portfolio index is required',
      );
    }

    const freelancer = await freelancerService.removePortfolioItem(
      String(req.user._id),
      index,
    );
    if (!freelancer) {
      throw new ApiError(
        HTTP_STATUS.NOT_FOUND,
        'Freelancer profile or portfolio item not found',
      );
    }

    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, 'Portfolio item removed', {
        freelancer,
      }),
    );
  },
);
