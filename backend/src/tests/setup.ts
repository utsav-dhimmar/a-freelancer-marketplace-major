import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { beforeAll, afterAll, afterEach, vi } from 'vitest';

// Mock EmailService globally
vi.mock('../services/email.service.js', () => ({
    emailService: {
        sendWelcomeEmail: vi.fn().mockResolvedValue(true),
        sendProposalAcceptedEmail: vi.fn().mockResolvedValue(true),
        sendNewProposalEmail: vi.fn().mockResolvedValue(true),
    },
}));

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    process.env.MONGODB_URI = mongoUri;
    process.env.JWT_SECRET = 'test_secret';

    if (mongoose.connection.readyState !== 1) {
        await mongoose.connect(mongoUri, { dbName: 'testdb' });
    }
}, 60000);

afterAll(async () => {
    await mongoose.disconnect();
    if (mongoServer) {
        await mongoServer.stop();
    }
});

afterEach(async () => {
    vi.resetAllMocks();
    if (mongoose.connection.readyState === 1) {
        const collections = mongoose.connection.collections;
        for (const key in collections) {
            const collection = collections[key];
            await collection?.deleteMany({});
        }
    }
});
