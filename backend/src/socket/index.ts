import type { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { HTTP_STATUS } from '../constants/index.js';
import { User } from '../model/user.model.js';
import { contractService } from '../services/contracts.service.js';
import { chatService } from '../services/chat.service.js';
import { verifyAccessToken } from '../utils/jwt.util.js';
import type {
  AuthenticatedSocketData,
  JoinContractPayload,
  MessageReadEventPayload,
  MessageReadPayload,
  NewMessagePayload,
  SendMessagePayload,
  SocketAckResponse,
} from '../types/socker.types.js';

const isChatEnabledForStatus = (status: string): boolean =>
  status === 'active' || status === 'submitted';

const getRoomName = (contractId: string): string => `contract:${contractId}`;

const extractToken = (
  authToken: unknown,
  authHeader: string | string[] | undefined,
): string | null => {
  if (typeof authToken === 'string' && authToken.trim()) {
    return authToken.startsWith('Bearer ')
      ? authToken.slice(7).trim()
      : authToken.trim();
  }

  if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }

  return null;
};

const validateContractAccess = async (
  contractId: string,
  userId: string,
): Promise<{ ok: true } | { ok: false; error: string; statusCode: number }> => {
  const contract = await contractService.findById(contractId);
  if (!contract) {
    return {
      ok: false,
      error: 'Contract not found',
      statusCode: HTTP_STATUS.NOT_FOUND,
    };
  }

  if (!isChatEnabledForStatus(contract.status)) {
    return {
      ok: false,
      error: 'Chat is only available for active or submitted contracts',
      statusCode: HTTP_STATUS.BAD_REQUEST,
    };
  }

  const isParty = await contractService.isContractParty(contractId, userId);
  if (!isParty) {
    return {
      ok: false,
      error: 'You can only chat in contracts you are part of',
      statusCode: HTTP_STATUS.FORBIDDEN,
    };
  }

  return { ok: true };
};

export const initializeSocketServer = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = extractToken(
        socket.handshake.auth.token,
        socket.handshake.headers.authorization,
      );
      if (!token) {
        next(new Error('Unauthorized: missing token'));
        return;
      }

      const decoded = verifyAccessToken(token);
      if (!decoded) {
        next(new Error('Unauthorized: invalid token'));
        return;
      }

      const user = await User.findById(decoded.userId).select('-password');
      if (!user) {
        next(new Error('Unauthorized: user not found'));
        return;
      }

      (socket.data as AuthenticatedSocketData).user = user;
      next();
    } catch (error) {
      console.error('[SOCKET] Auth middleware error:', error);
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    const user = (socket.data as AuthenticatedSocketData).user;
    const userId = String(user._id);

    socket.on(
      'join_contract',
      async (
        payload: JoinContractPayload,
        ack?: (response: SocketAckResponse) => void,
      ) => {
        try {
          const contractId = payload?.contractId;
          if (!contractId) {
            ack?.({ ok: false, error: 'contractId is required' });
            return;
          }

          const access = await validateContractAccess(contractId, userId);
          if (!access.ok) {
            ack?.({ ok: false, error: access.error });
            return;
          }

          await socket.join(getRoomName(contractId));
          ack?.({ ok: true });
        } catch (error) {
          console.error('[SOCKET] join_contract error:', error);
          ack?.({ ok: false, error: 'Failed to join contract room' });
        }
      },
    );

    socket.on('leave_contract', (payload: JoinContractPayload) => {
      const contractId = payload?.contractId;
      if (!contractId) return;
      void socket.leave(getRoomName(contractId));
    });

    socket.on(
      'send_message',
      async (
        payload: SendMessagePayload,
        ack?: (response: SocketAckResponse) => void,
      ) => {
        try {
          const contractId = payload?.contractId;
          const rawMessage = payload?.message;
          const message =
            typeof rawMessage === 'string' ? rawMessage.trim() : '';

          if (!contractId) {
            ack?.({ ok: false, error: 'contractId is required' });
            return;
          }

          if (!message) {
            ack?.({ ok: false, error: 'Message cannot be empty' });
            return;
          }

          const access = await validateContractAccess(contractId, userId);
          if (!access.ok) {
            ack?.({ ok: false, error: access.error });
            return;
          }

          const senderName = user.fullname || user.email || 'Unknown';
          const chatMessage = await chatService.sendMessage(
            contractId,
            userId,
            senderName,
            message,
          );

          const eventPayload: NewMessagePayload = {
            contractId,
            message: chatMessage,
          };
          io.to(getRoomName(contractId)).emit('new_message', eventPayload);
          ack?.({ ok: true });
        } catch (error) {
          console.error('[SOCKET] send_message error:', error);
          ack?.({ ok: false, error: 'Failed to send message' });
        }
      },
    );

    socket.on(
      'message_read',
      async (
        payload: MessageReadPayload,
        ack?: (response: SocketAckResponse) => void,
      ) => {
        try {
          const contractId = payload?.contractId;
          if (!contractId) {
            ack?.({ ok: false, error: 'contractId is required' });
            return;
          }

          const access = await validateContractAccess(contractId, userId);
          if (!access.ok) {
            ack?.({ ok: false, error: access.error });
            return;
          }

          const updatedMessageIds = await chatService.markMessagesAsRead(
            contractId,
            userId,
            payload?.messageIds,
          );

          if (updatedMessageIds.length > 0) {
            const eventPayload: MessageReadEventPayload = {
              contractId,
              userId,
              messageIds: updatedMessageIds,
              readAt: new Date().toISOString(),
            };
            io.to(getRoomName(contractId)).emit('message_read', eventPayload);
          }

          ack?.({ ok: true });
        } catch (error) {
          console.error('[SOCKET] message_read error:', error);
          ack?.({ ok: false, error: 'Failed to update read status' });
        }
      },
    );

    socket.on('disconnect', () => {
      // No-op for now; useful extension point for presence.
      // HMM
    });
  });

  return io;
};
