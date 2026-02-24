import type { NextFunction, Request, Response } from 'express';
import { HTTP_STATUS } from '../constants/index.js';
import type { AuthRequest } from '../middleware/auth.middleware.js';
import { jobService, type JobSearchFilters } from '../services/job.service.js';
import { ApiError, ApiResponse } from '../utils/ApiHelper.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * POST /api/jobs
 * Create a new job posting (Client only)
 */
export const createJob = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated');
    }

    // Only clients can create jobs
    if (req.user.role !== 'client') {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        'Only clients can create job postings',
      );
    }

    const {
      title,
      description,
      difficulty,
      budget,
      budgetType,
      skillsRequired,
    } = req.body;

    // Validate required fields
    if (
      !title ||
      !description ||
      !difficulty ||
      budget === undefined ||
      !budgetType
    ) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        'All fields are required (title, description, difficulty, budget, budgetType)',
      );
    }

    // Validate difficulty
    const validDifficulties = ['entry', 'intermediate', 'expert'];
    if (!validDifficulties.includes(difficulty)) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        'Invalid difficulty. Must be entry, intermediate, or expert',
      );
    }

    // Validate budgetType
    const validBudgetTypes = ['fixed', 'hourly'];
    if (!validBudgetTypes.includes(budgetType)) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        'Invalid budget type. Must be fixed or hourly',
      );
    }

    const job = await jobService.createJob({
      client: String(req.user._id),
      title,
      description,
      difficulty,
      budget,
      budgetType,
      skillsRequired,
    });

    res.status(HTTP_STATUS.CREATED).json(
      new ApiResponse(HTTP_STATUS.CREATED, 'Job created successfully', {
        job,
      }),
    );
  },
);

/**
 * GET /api/jobs
 * Get all open jobs with pagination
 */
export const getAllJobs = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = (req.query.status as string) || 'open';

    const result = await jobService.getAllJobs(page, limit, status);
    if (!result.jobs || result.jobs.length == 0) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Jobs not found');
    }
    res
      .status(HTTP_STATUS.OK)
      .json(new ApiResponse(HTTP_STATUS.OK, 'Jobs retrieved', result));
  },
);

/**
 * GET /api/jobs/search
 * Search jobs with filters
 */
export const searchJobs = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const filters: JobSearchFilters = {
      skills: req.query.skills
        ? (req.query.skills as string).split(',').map((s) => s.trim())
        : [''],
      difficulty: req.query.difficulty as 'entry' | 'intermediate' | 'expert',
      budgetType: req.query.budgetType as 'fixed' | 'hourly',
      minBudget: req.query.minBudget
        ? parseInt(req.query.minBudget as string)
        : 0,
      maxBudget: req.query.maxBudget
        ? parseInt(req.query.maxBudget as string)
        : 0,
      status: req.query.status as
        | 'open'
        | 'in_progress'
        | 'completed'
        | 'cancelled',
    };

    const result = await jobService.searchJobs(filters, page, limit);
    if (!result.jobs || result.jobs.length == 0) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Jobs not found');
    }
    res
      .status(HTTP_STATUS.OK)
      .json(new ApiResponse(HTTP_STATUS.OK, 'Search results', result));
  },
);

/**
 * GET /api/jobs/my-jobs
 * Get jobs posted by the authenticated client
 */
export const getMyJobs = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated');
    }

    if (req.user.role !== 'client') {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        'Only clients can view their job postings',
      );
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await jobService.getJobsByClient(
      String(req.user._id),
      page,
      limit,
    );
    if (!result.jobs || result.jobs.length == 0) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Jobs not found');
    }
    res
      .status(HTTP_STATUS.OK)
      .json(new ApiResponse(HTTP_STATUS.OK, 'Your jobs retrieved', result));
  },
);

/**
 * GET /api/jobs/:id
 * Get job by ID
 */
export const getJobById = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const id = req.params.id as string;

    if (!id) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Job ID is required');
    }

    const job = await jobService.findById(id);
    if (!job) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Job not found');
    }

    res
      .status(HTTP_STATUS.OK)
      .json(new ApiResponse(HTTP_STATUS.OK, 'Job retrieved', { job }));
  },
);

/**
 * PUT /api/jobs/:id
 * Update job posting (Owner only)
 */
export const updateJob = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated');
    }

    const id = req.params.id as string;

    // Check ownership
    const isOwner = await jobService.isJobOwner(id, String(req.user._id));
    if (!isOwner) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        'You can only update your own job postings',
      );
    }

    const {
      title,
      description,
      difficulty,
      budget,
      budgetType,
      skillsRequired,
    } = req.body;

    const job = await jobService.updateJob(id, {
      title,
      description,
      difficulty,
      budget,
      budgetType,
      skillsRequired,
    });

    if (!job) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Job not found');
    }

    res
      .status(HTTP_STATUS.OK)
      .json(
        new ApiResponse(HTTP_STATUS.OK, 'Job updated successfully', { job }),
      );
  },
);

/**
 * PATCH /api/jobs/:id/status
 * Update job status (Owner only)
 */
export const updateJobStatus = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated');
    }

    const id = req.params.id as string;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['open', 'in_progress', 'completed', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        'Invalid status. Must be open, in_progress, completed, or cancelled',
      );
    }

    // Check ownership
    const isOwner = await jobService.isJobOwner(id, String(req.user._id));
    if (!isOwner) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        'You can only update status of your own job postings',
      );
    }

    const job = await jobService.updateJobStatus(id, status);

    if (!job) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Job not found');
    }

    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, 'Job status updated successfully', {
        job,
      }),
    );
  },
);

/**
 * DELETE /api/jobs/:id
 * Delete job posting (Owner only)
 */
export const deleteJob = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated');
    }

    const id = req.params.id as string;

    // Check ownership
    const isOwner = await jobService.isJobOwner(id, String(req.user._id));
    if (!isOwner) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        'You can only delete your own job postings',
      );
    }

    const job = await jobService.deleteJob(id);
    if (!job) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Job not found');
    }

    res
      .status(HTTP_STATUS.OK)
      .json(new ApiResponse(HTTP_STATUS.OK, 'Job deleted successfully', null));
  },
);
