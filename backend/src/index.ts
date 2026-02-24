import app from './app.js';
import { connectDB } from './db/index.js';

const PORT = process.env.PORT || 8000;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    app.listen(PORT, () => {
      console.log(`[SERVER] running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('[SERVER] Failed to start:', error);
    process.exit(1);
  }
};

startServer();
