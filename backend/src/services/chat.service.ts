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
        });

        const doc = await docRef.get();
        const data = doc.data()!;

        return {
            id: doc.id,
            senderId: data.senderId,
            senderName: data.senderName,
            message: data.message,
            timestamp: data.timestamp.toDate(),
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
}

export const chatService = new ChatService();
