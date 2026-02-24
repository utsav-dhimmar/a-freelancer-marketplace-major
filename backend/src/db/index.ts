import mongoose from 'mongoose';

/**
 * Connect to MongoDB database
 */
export const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }

    await mongoose.connect(mongoUri, {
      dbName: 'freelancer',
    });
    console.log('[DB] MongoDB connected successfully');
  } catch (error) {
    console.error('[DB] MongoDB connection error:', error);
    process.exit(1);
  }
};

/**
 * Disconnect from MongoDB database
 */
export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('[DB] MongoDB disconnected');
  } catch (error) {
    console.error('[DB] MongoDB disconnect error:', error);
  }
};
