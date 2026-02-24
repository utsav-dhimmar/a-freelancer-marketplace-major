import { Router } from 'express';
import {
  getProposalsByJobId,
  getFreelancerProposals,
  createProposal,
  updateProposal,
  updateProposalStatus,
  deleteProposal,
  getProposalByProposalId,
} from '../controllers/proposals.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

/**
 * @route   GET /api/proposals/job/:jobid
 * @desc    Get proposals for a job
 * @access  Private (Job Owner only)
 */
router.get('/job/:jobid', authMiddleware, getProposalsByJobId);

/**
 * @route   GET /api/proposals/my-proposals
 * @desc    Get freelancer's proposals
 * @access  Private (Freelancer only)
 */
router.get('/my-proposals', authMiddleware, getFreelancerProposals);

/**
 * @route   GET /api/proposals/:id
 * @desc    Get proposal by ID
 * @access  Private (Freelancer or Job Owner)
 */
router.get('/:id', authMiddleware, getProposalByProposalId);

/**
 * @route   POST /api/proposals
 * @desc    Submit proposal to job
 * @access  Private (Freelancer only)
 */
router.post('/', authMiddleware, createProposal);

/**
 * @route   PUT /api/proposals/:id
 * @desc    Update proposal
 * @access  Private (Owner only, pending status)
 */
router.put('/:id', authMiddleware, updateProposal);

/**
 * @route   PATCH /api/proposals/:id/status
 * @desc    Update proposal status
 * @access  Private (Job Owner only)
 */
router.patch('/:id/status', authMiddleware, updateProposalStatus);

/**
 * @route   DELETE /api/proposals/:id
 * @desc    Withdraw proposal
 * @access  Private (Owner only, pending status)
 */
router.delete('/:id', authMiddleware, deleteProposal);

export default router;
