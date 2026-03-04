import app from './app.js';
import { connectDB } from './db/index.js';
import { createServer } from 'http';
import { initializeSocketServer } from './socket/index.js';

const PORT = process.env.PORT || 8000;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    const server = createServer(app);
    initializeSocketServer(server);

    server.listen(PORT, () => {
      console.log(`[SERVER] running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('[SERVER] Failed to start:', error);
    process.exit(1);
  }
};

startServer();
