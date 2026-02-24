import type { NextFunction, Response } from 'express';
import { HTTP_STATUS } from '../constants/index.js';
import type { AuthRequest } from '../middleware/auth.middleware.js';
import { contractService } from '../services/contracts.service.js';
import { freelancerService } from '../services/freelancer.service.js';
import { jobService } from '../services/job.service.js';
import { proposalService } from '../services/proposals.service.js';
import { ApiError, ApiResponse } from '../utils/ApiHelper.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * GET /api/contracts
 * Get user's contracts (as client or freelancer)
 */
export const getContracts = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated');
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await contractService.getContractsByUser(
      String(req.user._id),
      page,
      limit,
    );
    if (!result.contracts || result.contracts.length == 0) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Contracts not found');
    }
    res
      .status(HTTP_STATUS.OK)
      .json(new ApiResponse(HTTP_STATUS.OK, 'Contracts retrieved', result));
  },
);

/**
 * GET /api/contracts/:id
 * Get contract by ID (only parties can view)
 */
export const getContractById = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated');
    }

    const id = req.params.id as string;

    // Check if user is a party
    const isParty = await contractService.isContractParty(
      id,
      String(req.user._id),
    );
    if (!isParty) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        'You can only view contracts you are part of',
      );
    }

    const contract = await contractService.findById(id);
    if (!contract) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Contract not found');
    }

    res
      .status(HTTP_STATUS.OK)
      .json(
        new ApiResponse(HTTP_STATUS.OK, 'Contract retrieved', { contract }),
      );
  },
);

/**
 * POST /api/contracts
 * Create contract from accepted proposal (Client only)
 */
export const createContract = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated');
    }

    if (req.user.role !== 'client') {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        'Only clients can create contracts',
      );
    }

    const { proposal: proposalId } = req.body;

    if (!proposalId) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Proposal ID is required');
    }

    // Get proposal with job info
    const proposal = await proposalService.getProposalWithJobClient(proposalId);
    if (!proposal) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Proposal not found');
    }

    // Check if proposal is accepted
    if (proposal.status !== 'accepted') {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        'Can only create contracts from accepted proposals',
      );
    }

    // Check if user is the job owner
    const job = proposal.job as { client: { _id: string }; _id: string };
    if (String(job.client._id) !== String(req.user._id)) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        'You can only create contracts for your own jobs',
      );
    }

    // Check if contract already exists for this proposal
    const exists = await contractService.contractExistsForProposal(proposalId);
    if (exists) {
      throw new ApiError(
        HTTP_STATUS.CONFLICT,
        'Contract already exists for this proposal',
      );
    }

    const contract = await contractService.createContract({
      job: String(job._id),
      client: String(req.user._id),
      freelancer: String(proposal.freelancer._id),
      proposal: proposalId,
      amount: proposal.bidAmount,
    });

    res.status(HTTP_STATUS.CREATED).json(
      new ApiResponse(HTTP_STATUS.CREATED, 'Contract created successfully', {
        contract,
      }),
    );
  },
);

/**
 * PATCH /api/contracts/:id/status
 * Update contract status (Party only)
 */
export const updateContractStatus = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated');
    }

    const id = req.params.id as string;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['active', 'submitted', 'completed', 'disputed'];
    if (!status || !validStatuses.includes(status)) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        'Invalid status. Must be active, submitted, completed, or disputed',
      );
    }

    // Check if user is a party
    const isParty = await contractService.isContractParty(
      id,
      String(req.user._id),
    );
    if (!isParty) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        'You can only update contracts you are part of',
      );
    }

    const contract = await contractService.updateContractStatus(id, status);
    if (!contract) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Contract not found');
    }

    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, 'Contract status updated', {
        contract,
      }),
    );
  },
);

/**
 * PATCH /api/contracts/:id/submit
 * Freelancer submits work
 */
export const submitWork = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated');
    }

    const id = req.params.id as string;

    // Check if user is the freelancer
    const isFreelancer = await contractService.isContractFreelancer(
      id,
      String(req.user._id),
    );
    if (!isFreelancer) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        'Only the freelancer can submit work',
      );
    }

    // Check contract is active
    const existingContract = await contractService.findById(id);
    if (!existingContract) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Contract not found');
    }
    if (existingContract.status !== 'active') {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        'Can only submit work for active contracts',
      );
    }

    const contract = await contractService.updateContractStatus(
      id,
      'submitted',
    );

    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, 'Work submitted successfully', {
        contract,
      }),
    );
  },
);

/**
 * PATCH /api/contracts/:id/complete
 * Client marks contract as complete
 */
export const completeContract = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated');
    }

    const id = req.params.id as string;

    // Check if user is the client
    const isClient = await contractService.isContractClient(
      id,
      String(req.user._id),
    );
    if (!isClient) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        'Only the client can mark the contract as complete',
      );
    }

    // Check contract is submitted
    const existingContract = await contractService.findById(id);
    if (!existingContract) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Contract not found');
    }
    if (existingContract.status !== 'submitted') {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        'Can only complete contracts that have submitted work',
      );
    }

    const contract = await contractService.updateContractStatus(
      id,
      'completed',
    );

    // Update job status to completed
    if (contract) {
      const jobId = (contract.job as any)._id || contract.job;
      await jobService.updateJobStatus(String(jobId), 'completed');

      // Increment freelancer's total jobs
      const freelancerId =
        (contract.freelancer as any)._id || contract.freelancer;
      await freelancerService.incrementTotalJobs(String(freelancerId));
    }

    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, 'Contract completed successfully', {
        contract,
      }),
    );
  },
);

/**
 * PATCH /api/contracts/:id/dispute
 * Raise a dispute on the contract
 */
export const raiseDispute = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated');
    }

    const id = req.params.id as string;

    // Check if user is a party
    const isParty = await contractService.isContractParty(
      id,
      String(req.user._id),
    );
    if (!isParty) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        'You can only dispute contracts you are part of',
      );
    }

    // Check contract is active or submitted
    const existingContract = await contractService.findById(id);
    if (!existingContract) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Contract not found');
    }
    if (!['active', 'submitted'].includes(existingContract.status)) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        'Can only dispute active or submitted contracts',
      );
    }

    const contract = await contractService.updateContractStatus(id, 'disputed');

    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, 'Dispute raised successfully', {
        contract,
      }),
    );
  },
);
