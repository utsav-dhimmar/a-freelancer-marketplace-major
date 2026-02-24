import type { NextFunction, Response } from 'express';
import type { ObjectId } from 'mongoose';
import { HTTP_STATUS } from '../constants/index.js';
import type { AuthRequest } from '../middleware/auth.middleware.js';
import { jobService } from '../services/job.service.js';
import { proposalService } from '../services/proposals.service.js';
import { ApiError, ApiResponse } from '../utils/ApiHelper.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * GET /api/proposals/job/:jobid
 * Get proposals by job ID (Job owner only)
 */
export const getProposalsByJobId = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated');
    }

    const jobid = req.params.jobid as string;

    // Verify user is the job owner
    const isOwner = await jobService.isJobOwner(jobid, String(req.user._id));
    if (!isOwner) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        'You can only view proposals for your own jobs',
      );
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await proposalService.getProposalsByJobId(
      jobid,
      page,
      limit,
    );
    if (!result.proposals || result.proposals.length === 0) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Proposals not found');
    }
    res
      .status(HTTP_STATUS.OK)
      .json(new ApiResponse(HTTP_STATUS.OK, 'Proposals retrieved', result));
  },
);

/**
 * GET /api/proposals/:id
 * Get proposal by ID
 */
export const getProposalByProposalId = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated');
    }

    const id = req.params.id as string;

    const proposal = await proposalService.getProposalWithJobClient(id);
    if (!proposal) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Proposal not found');
    }

    // Check if user is either the freelancer or the job owner
    const isFreelancer =
      String(proposal.freelancer._id) === String(req.user._id);
    const job = proposal.job as { client: { _id: ObjectId } };
    const isJobOwner = String(job.client._id) === String(req.user._id);

    if (!isFreelancer && !isJobOwner) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        'You can only view your own proposals or proposals for your jobs',
      );
    }

    res
      .status(HTTP_STATUS.OK)
      .json(
        new ApiResponse(HTTP_STATUS.OK, 'Proposal retrieved', { proposal }),
      );
  },
);

/**
 * GET /api/proposals/my-proposals
 * Get proposals by freelancer ID
 */
export const getFreelancerProposals = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated');
    }

    if (req.user.role !== 'freelancer') {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        'Only freelancers can view their proposals',
      );
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await proposalService.getProposalsByFreelancer(
      String(req.user._id),
      page,
      limit,
    );
    if (!result.proposals || result.proposals.length) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Proposals not found');
    }
    res
      .status(HTTP_STATUS.OK)
      .json(
        new ApiResponse(HTTP_STATUS.OK, 'Your proposals retrieved', result),
      );
  },
);

/**
 * POST /api/proposals
 * Create a new proposal (Freelancer only)
 */
export const createProposal = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated');
    }

    if (req.user.role !== 'freelancer') {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        'Only freelancers can submit proposals',
      );
    }

    const { job, coverLetter, bidAmount, estimatedTime } = req.body;

    // Validate required fields
    if (!job || !coverLetter || bidAmount === undefined || !estimatedTime) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        'All fields are required (job, coverLetter, bidAmount, estimatedTime)',
      );
    }

    // Check if job exists and is open
    const jobDoc = await jobService.findById(job);
    if (!jobDoc) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Job not found');
    }
    if (jobDoc.status !== 'open') {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        'This job is not accepting proposals',
      );
    }

    // Check if freelancer already submitted a proposal
    const hasSubmitted = await proposalService.hasSubmittedProposal(
      job,
      String(req.user._id),
    );
    if (hasSubmitted) {
      throw new ApiError(
        HTTP_STATUS.CONFLICT,
        'You have already submitted a proposal for this job',
      );
    }

    const proposal = await proposalService.createProposal({
      job,
      freelancer: String(req.user._id),
      coverLetter,
      bidAmount,
      estimatedTime,
    });

    res.status(HTTP_STATUS.CREATED).json(
      new ApiResponse(HTTP_STATUS.CREATED, 'Proposal submitted successfully', {
        proposal,
      }),
    );
  },
);

/**
 * PUT /api/proposals/:id
 * Update proposal (Owner only, while pending)
 */
export const updateProposal = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated');
    }

    const id = req.params.id as string;

    // Check ownership
    const isOwner = await proposalService.isProposalOwner(
      id,
      String(req.user._id),
    );
    if (!isOwner) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        'You can only update your own proposals',
      );
    }

    // Check if proposal is still pending
    const existingProposal = await proposalService.findById(id);
    if (!existingProposal) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Proposal not found');
    }
    if (existingProposal.status !== 'pending') {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        'Only pending proposals can be updated',
      );
    }

    const { coverLetter, bidAmount, estimatedTime } = req.body;

    const proposal = await proposalService.updateProposal(id, {
      coverLetter,
      bidAmount,
      estimatedTime,
    });

    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, 'Proposal updated successfully', {
        proposal,
      }),
    );
  },
);

/**
 * PATCH /api/proposals/:id/status
 * Update proposal status (Job owner only)
 */
export const updateProposalStatus = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated');
    }

    const id = req.params.id as string;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['pending', 'shortlisted', 'accepted', 'rejected'];
    if (!status || !validStatuses.includes(status)) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        'Invalid status. Must be pending, shortlisted, accepted, or rejected',
      );
    }

    // Get proposal with job info
    const proposal = await proposalService.getProposalWithJobClient(id);
    if (!proposal) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Proposal not found');
    }

    // Check if user is the job owner
    const job = proposal.job as { client: { _id: string }; _id: string };
    const isJobOwner = String(job.client._id) === String(req.user._id);
    if (!isJobOwner) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        'Only the job owner can update proposal status',
      );
    }

    const updatedProposal = await proposalService.updateProposalStatus(
      id,
      status,
    );

    // If accepted, update job status to in_progress
    if (status === 'accepted') {
      await jobService.updateJobStatus(String(job._id), 'in_progress');
    }

    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, 'Proposal status updated', {
        proposal: updatedProposal,
      }),
    );
  },
);

/**
 * DELETE /api/proposals/:id
 * Delete/withdraw proposal (Owner only, while pending)
 */
export const deleteProposal = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated');
    }

    const id = req.params.id as string;

    // Check ownership
    const isOwner = await proposalService.isProposalOwner(
      id,
      String(req.user._id),
    );
    if (!isOwner) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        'You can only withdraw your own proposals',
      );
    }

    // Check if proposal is still pending
    const existingProposal = await proposalService.findById(id);
    if (!existingProposal) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Proposal not found');
    }
    if (existingProposal.status !== 'pending') {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        'Only pending proposals can be withdrawn',
      );
    }

    await proposalService.deleteProposal(id);

    res
      .status(HTTP_STATUS.OK)
      .json(
        new ApiResponse(
          HTTP_STATUS.OK,
          'Proposal withdrawn successfully',
          null,
        ),
      );
  },
);
