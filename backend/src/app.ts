import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';

import { HTTP_STATUS } from './constants/index.js';
import adminRoutes from './routes/admin.routes.js';
import contractRoutes from './routes/contracts.routes.js';
import freelancerRoutes from './routes/freelancer.routes.js';
import jobRoutes from './routes/job.routes.js';
import proposalRoutes from './routes/proposals.routes.js';
import userRoutes from './routes/user.routes.js';
import chatRoutes from './routes/chat.routes.js';
import { ApiError } from './utils/ApiHelper.js';

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files from public folder
app.use(express.static('public'));
app.use((req, res, next) => {
  console.log(
    `[URL]: ${req.url} [METHOD]: ${req.method} [STATUS]: ${res.statusCode}`,
  );
  // console.log(req);
  next();
});

// Routes
app.get('/', (req, res) => {
  return res.json({
    message: 'Welcome to the Freelancer Marketplace API',
  });
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/freelancers', freelancerRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);

// Error handling for 404/Unknown routes
app.use((req, res, next) => {
  const error = new ApiError(HTTP_STATUS.NOT_FOUND, `${req.path} is not found`);
  next(error);
});

// Global Error Handler
app.use((err: any, req: any, res: any, next: any) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || [];

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = 'Validation Failed';
    // Format mongoose validation errors if needed, but keeping it simple for now as per current logic
    errors = err.errors;
  }

  // Handle Mongoose Cast Error (e.g., invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  console.error(
    `[ERROR] ${req.method} ${req.url} - ${statusCode} - ${message}`,
  );
  if (err.stack && process.env.NODE_ENV !== 'production') {
    // console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

export default app;
