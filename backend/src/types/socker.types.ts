import type { IUser } from '../model/user.model.js';
import type { IChatMessage } from '../services/chat.service.js';

export interface SocketAckResponse {
  ok: boolean;
  error?: string;
}

export interface JoinContractPayload {
  contractId: string;
}

export interface SendMessagePayload {
  contractId: string;
  message: string;
}

export interface MessageReadPayload {
  contractId: string;
  messageIds?: string[];
}

export interface NewMessagePayload {
  contractId: string;
  message: IChatMessage;
}

export interface MessageReadEventPayload {
  contractId: string;
  userId: string;
  messageIds: string[];
  readAt: string;
}

export interface AuthenticatedSocketData {
  user: IUser;
}
