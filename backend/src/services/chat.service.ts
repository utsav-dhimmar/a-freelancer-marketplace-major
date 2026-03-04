import { db } from '../config/firebase.config.js';

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
   * Get the messages sub-collection reference for a contract
   */
  private getMessagesRef(contractId: string) {
    return db.collection('chats').doc(contractId).collection('messages');
  }

  /**
   * Send a message in a contract chat
   */
  async sendMessage(
    contractId: string,
    senderId: string,
    senderName: string,
    message: string,
  ): Promise<IChatMessage> {
    const messagesRef = this.getMessagesRef(contractId);

    const docRef = await messagesRef.add({
      senderId,
      senderName,
      message,
      timestamp: new Date(),
      readBy: [senderId],
    });

    const doc = await docRef.get();
    const data = doc.data()!;

    return {
      id: doc.id,
      senderId: data.senderId,
      senderName: data.senderName,
      message: data.message,
      timestamp: data.timestamp.toDate(),
      readBy: Array.isArray(data.readBy) ? data.readBy : [],
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
    const messagesRef = this.getMessagesRef(contractId);

    // Get total count
    const countSnapshot = await messagesRef.count().get();
    const total = countSnapshot.data().count;
    const totalPages = Math.ceil(total / limit);

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Get paginated messages (newest first)
    const snapshot = await messagesRef
      .orderBy('timestamp', 'desc')
      .offset(offset)
      .limit(limit)
      .get();

    const messages: IChatMessage[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        senderId: data.senderId,
        senderName: data.senderName,
        message: data.message,
        timestamp: data.timestamp.toDate(),
        readBy: Array.isArray(data.readBy) ? data.readBy : [],
      };
    });

    return {
      messages,
      total,
      page,
      totalPages,
    };
  }

  /**
   * Get chat info/metadata for a contract
   */
  async getChatInfo(contractId: string): Promise<IChatInfo> {
    const messagesRef = this.getMessagesRef(contractId);

    // Get total count
    const countSnapshot = await messagesRef.count().get();
    const totalMessages = countSnapshot.data().count;

    // Get the latest message
    const latestSnapshot = await messagesRef
      .orderBy('timestamp', 'desc')
      .limit(1)
      .get();

    let lastMessageAt: Date | null = null;
    let lastMessage: string | null = null;
    let lastSenderName: string | null = null;

    const latestDoc = latestSnapshot.docs[0];
    if (latestDoc) {
      const data = latestDoc.data();
      lastMessageAt = data.timestamp.toDate();
      lastMessage = data.message;
      lastSenderName = data.senderName;
    }

    return {
      contractId,
      totalMessages,
      lastMessageAt,
      lastMessage,
      lastSenderName,
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
    const messagesRef = this.getMessagesRef(contractId);
    const updatedMessageIds: string[] = [];

    if (messageIds && messageIds.length > 0) {
      const uniqueIds = Array.from(new Set(messageIds));
      for (const messageId of uniqueIds) {
        const docRef = messagesRef.doc(messageId);
        const doc = await docRef.get();
        if (!doc.exists) continue;

        const data = doc.data();
        if (!data) continue;

        const isOwnMessage = data.senderId === readerId;
        const currentReadBy = Array.isArray(data.readBy) ? data.readBy : [];
        const alreadyRead = currentReadBy.includes(readerId);

        if (isOwnMessage || alreadyRead) continue;

        await docRef.update({
          readBy: [...currentReadBy, readerId],
        });
        updatedMessageIds.push(doc.id);
      }
      return updatedMessageIds;
    }

    const snapshot = await messagesRef
      .orderBy('timestamp', 'desc')
      .limit(200)
      .get();

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const isOwnMessage = data.senderId === readerId;
      const currentReadBy = Array.isArray(data.readBy) ? data.readBy : [];
      const alreadyRead = currentReadBy.includes(readerId);

      if (isOwnMessage || alreadyRead) continue;

      await doc.ref.update({
        readBy: [...currentReadBy, readerId],
      });
      updatedMessageIds.push(doc.id);
    }

    return updatedMessageIds;
  }
}

export const chatService = new ChatService();
