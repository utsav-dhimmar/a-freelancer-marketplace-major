import { Types } from 'mongoose';
import { Message } from '../model/message.model.js';

/**
 * Interface for a chat message
 */
export interface IChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: Date;
  readBy: string[];
}

/**
 * Interface for chat info/metadata
 */
export interface IChatInfo {
  contractId: string;
  totalMessages: number;
  lastMessageAt: Date | null;
  lastMessage: string | null;
  lastSenderName: string | null;
}

export class ChatService {
  /**
   * Send a message in a contract chat
   */
  async sendMessage(
    contractId: string,
    senderId: string,
    senderName: string,
    message: string,
  ): Promise<IChatMessage> {
    const newMessage = await Message.create({
      contractId: new Types.ObjectId(contractId),
      senderId: new Types.ObjectId(senderId),
      senderName,
      message,
      readBy: [new Types.ObjectId(senderId)],
    });

    return {
      id: newMessage._id.toString(),
      senderId: newMessage.senderId.toString(),
      senderName: newMessage.senderName,
      message: newMessage.message,
      timestamp: newMessage.createdAt,
      readBy: newMessage.readBy.map((id) => id.toString()),
    };
  }

  /**
   * Get paginated messages for a contract chat (newest first)
   */
  async getMessages(
    contractId: string,
    page: number = 1,
    limit: number = 50,
  ): Promise<{
    messages: IChatMessage[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const contractObjectId = new Types.ObjectId(contractId);

    const [messages, total] = await Promise.all([
      Message.find({ contractId: contractObjectId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Message.countDocuments({ contractId: contractObjectId }),
    ]);

    const totalPages = Math.ceil(total / limit);

    const formattedMessages: IChatMessage[] = messages.map((m: any) => ({
      id: m._id.toString(),
      senderId: m.senderId.toString(),
      senderName: m.senderName,
      message: m.message,
      timestamp: m.createdAt,
      readBy: m.readBy.map((id: any) => id.toString()),
    }));

    return {
      messages: formattedMessages,
      total,
      page,
      totalPages,
    };
  }

  /**
   * Get chat info/metadata for a contract
   */
  async getChatInfo(contractId: string): Promise<IChatInfo> {
    const contractObjectId = new Types.ObjectId(contractId);

    const totalMessages = await Message.countDocuments({
      contractId: contractObjectId,
    });

    const latestMessage = await Message.findOne({
      contractId: contractObjectId,
    })
      .sort({ createdAt: -1 })
      .lean();

    return {
      contractId,
      totalMessages,
      lastMessageAt: latestMessage ? latestMessage.createdAt : null,
      lastMessage: latestMessage ? latestMessage.message : null,
      lastSenderName: latestMessage ? latestMessage.senderName : null,
    };
  }

  /**
   * Mark messages as read by a user and return changed message IDs
   */
  async markMessagesAsRead(
    contractId: string,
    readerId: string,
    messageIds?: string[],
  ): Promise<string[]> {
    const readerObjectId = new Types.ObjectId(readerId);
    const contractObjectId = new Types.ObjectId(contractId);

    if (messageIds && messageIds.length > 0) {
      const uniqueIds = messageIds.map((id) => new Types.ObjectId(id));

      const filter = {
        _id: { $in: uniqueIds },
        contractId: contractObjectId,
        senderId: { $ne: readerObjectId },
        readBy: { $ne: readerObjectId },
      };

      const messagesToUpdate = await Message.find(filter).select('_id').lean();
      const idsToUpdate = messagesToUpdate.map((m) => m._id);

      if (idsToUpdate.length > 0) {
        await Message.updateMany(
          { _id: { $in: idsToUpdate } },
          { $addToSet: { readBy: readerObjectId } },
        );
      }

      return idsToUpdate.map((id) => id.toString());
    }

    // Default: mark last 200 messages as read
    const filter = {
      contractId: contractObjectId,
      senderId: { $ne: readerObjectId },
      readBy: { $ne: readerObjectId },
    };

    const messagesToUpdate = await Message.find(filter)
      .sort({ createdAt: -1 })
      .limit(200)
      .select('_id')
      .lean();

    const idsToUpdate = messagesToUpdate.map((m) => m._id);

    if (idsToUpdate.length > 0) {
      await Message.updateMany(
        { _id: { $in: idsToUpdate } },
        { $addToSet: { readBy: readerObjectId } },
      );
    }

    return idsToUpdate.map((id) => id.toString());
  }
}

export const chatService = new ChatService();
