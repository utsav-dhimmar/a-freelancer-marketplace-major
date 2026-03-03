import type { NextFunction, Response } from 'express';
import { HTTP_STATUS } from '../constants/index.js';
import type { AuthRequest } from '../middleware/auth.middleware.js';
import { chatService } from '../services/chat.service.js';
import { contractService } from '../services/contracts.service.js';
import { ApiError, ApiResponse } from '../utils/ApiHelper.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * POST /api/chat/:contractId/messages
 * Send a message in a contract chat
 */
export const sendMessage = asyncHandler(
    async (req: AuthRequest, res: Response, _next: NextFunction) => {
        if (!req.user) {
            throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated');
        }

        const contractId = req.params.contractId as string;
        const { message } = req.body;

        if (!message || typeof message !== 'string' || !message.trim()) {
            throw new ApiError(
                HTTP_STATUS.BAD_REQUEST,
                'Message is required and must be a non-empty string',
            );
        }

        // Verify contract exists
        const contract = await contractService.findById(contractId);
        if (!contract) {
            throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Contract not found');
        }

        // Only allow chat on active or submitted contracts
        if (!['active', 'submitted'].includes(contract.status)) {
            throw new ApiError(
                HTTP_STATUS.BAD_REQUEST,
                'Chat is only available for active or submitted contracts',
            );
        }

        // Check if user is a party to the contract
        const isParty = await contractService.isContractParty(
            contractId,
            String(req.user._id),
        );
        if (!isParty) {
            throw new ApiError(
                HTTP_STATUS.FORBIDDEN,
                'You can only chat in contracts you are part of',
            );
        }

        const senderName = req.user.fullname || req.user.email || 'Unknown';

        const chatMessage = await chatService.sendMessage(
            contractId,
            String(req.user._id),
            senderName,
            message.trim(),
        );

        res.status(HTTP_STATUS.CREATED).json(
            new ApiResponse(HTTP_STATUS.CREATED, 'Message sent successfully', {
                message: chatMessage,
            }),
        );
    },
);

/**
 * GET /api/chat/:contractId/messages
 * Get paginated messages for a contract chat
 */
export const getMessages = asyncHandler(
    async (req: AuthRequest, res: Response, _next: NextFunction) => {
        if (!req.user) {
            throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated');
        }

        const contractId = req.params.contractId as string;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;

        // Verify contract exists
        const contract = await contractService.findById(contractId);
        if (!contract) {
            throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Contract not found');
        }

        // Check if user is a party to the contract
        const isParty = await contractService.isContractParty(
            contractId,
            String(req.user._id),
        );
        if (!isParty) {
            throw new ApiError(
                HTTP_STATUS.FORBIDDEN,
                'You can only view messages in contracts you are part of',
            );
        }

        const result = await chatService.getMessages(contractId, page, limit);

        res
            .status(HTTP_STATUS.OK)
            .json(new ApiResponse(HTTP_STATUS.OK, 'Messages retrieved', result));
    },
);

/**
 * GET /api/chat/:contractId/info
 * Get chat info/metadata for a contract
 */
export const getChatInfo = asyncHandler(
    async (req: AuthRequest, res: Response, _next: NextFunction) => {
        if (!req.user) {
            throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated');
        }

        const contractId = req.params.contractId as string;

        // Verify contract exists
        const contract = await contractService.findById(contractId);
        if (!contract) {
            throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Contract not found');
        }

        // Check if user is a party to the contract
        const isParty = await contractService.isContractParty(
            contractId,
            String(req.user._id),
        );
        if (!isParty) {
            throw new ApiError(
                HTTP_STATUS.FORBIDDEN,
                'You can only view chat info for contracts you are part of',
            );
        }

        const chatInfo = await chatService.getChatInfo(contractId);

        res
            .status(HTTP_STATUS.OK)
            .json(
                new ApiResponse(HTTP_STATUS.OK, 'Chat info retrieved', { chatInfo }),
            );
    },
);
