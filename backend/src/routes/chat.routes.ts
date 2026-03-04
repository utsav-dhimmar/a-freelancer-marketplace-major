import { Router } from 'express';
import {
  sendMessage,
  getMessages,
  getChatInfo,
} from '../controllers/chat.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

/**
 * @route   POST /api/chat/:contractId/messages
 * @desc    Send a message in a contract chat
 * @access  Private (Contract party only)
 */
router.post('/:contractId/messages', authMiddleware, sendMessage);

/**
 * @route   GET /api/chat/:contractId/messages
 * @desc    Get paginated messages for a contract chat
 * @access  Private (Contract party only)
 */
router.get('/:contractId/messages', authMiddleware, getMessages);

/**
 * @route   GET /api/chat/:contractId/info
 * @desc    Get chat info/metadata
 * @access  Private (Contract party only)
 */
router.get('/:contractId/info', authMiddleware, getChatInfo);

export default router;
