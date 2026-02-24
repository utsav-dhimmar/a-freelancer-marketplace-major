import cors from 'cors';
import express from 'express';

import { HTTP_STATUS } from './constants/index.js';
import contractRoutes from './routes/contracts.routes.js';
import freelancerRoutes from './routes/freelancer.routes.js';
import jobRoutes from './routes/job.routes.js';
import proposalRoutes from './routes/proposals.routes.js';
import userRoutes from './routes/user.routes.js';
import { ApiError } from './utils/ApiHelper.js';

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
  }),
);
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files from public folder
app.use(express.static('public'));
app.use((req, res, next) => {
  console.log(
    `[URL]: ${req.url} [METHOD]: ${req.method} [STATUS]: ${res.statusCode}`,
  );
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

app.use((req, res) => {
  return res
    .status(HTTP_STATUS.BAD_REQUEST)
    .json(new ApiError(HTTP_STATUS.BAD_REQUEST, `${req.path} is not found`));
});

export default app;
