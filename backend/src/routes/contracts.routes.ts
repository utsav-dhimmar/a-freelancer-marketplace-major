import { Router } from 'express';
import {
  getContracts,
  getContractById,
  createContract,
  updateContractStatus,
  submitWork,
  completeContract,
  raiseDispute,
} from '../controllers/contracts.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

/**
 * @route   GET /api/contracts
 * @desc    Get user's contracts
 * @access  Private
 */
router.get('/', authMiddleware, getContracts);

/**
 * @route   GET /api/contracts/:id
 * @desc    Get contract by ID
 * @access  Private (Party only)
 */
router.get('/:id', authMiddleware, getContractById);

/**
 * @route   POST /api/contracts
 * @desc    Create contract from accepted proposal
 * @access  Private (Client only)
 */
router.post('/', authMiddleware, createContract);

/**
 * @route   PATCH /api/contracts/:id/status
 * @desc    Update contract status
 * @access  Private (Party only)
 */
router.patch('/:id/status', authMiddleware, updateContractStatus);

/**
 * @route   PATCH /api/contracts/:id/submit
 * @desc    Freelancer submits work
 * @access  Private (Freelancer only)
 */
router.patch('/:id/submit', authMiddleware, submitWork);

/**
 * @route   PATCH /api/contracts/:id/complete
 * @desc    Client marks contract as complete
 * @access  Private (Client only)
 */
router.patch('/:id/complete', authMiddleware, completeContract);

/**
 * @route   PATCH /api/contracts/:id/dispute
 * @desc    Raise dispute on contract
 * @access  Private (Party only)
 */
router.patch('/:id/dispute', authMiddleware, raiseDispute);

export default router;
