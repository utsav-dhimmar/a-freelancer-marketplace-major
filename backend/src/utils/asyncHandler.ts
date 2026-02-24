import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { ApiError } from './ApiHelper.js';

/**
 * Async handler wrapper to eliminate reapated try-catch blocks
 * Catches errors and passes them to error handler or responds directly
 */
const asyncHandler = (requestHandler: RequestHandler): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await requestHandler(req, res, next);
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode || 500).json({
          success: false,
          message: error.message,
          errors: error.errors,
        });
      } else {
        console.error('[ERROR]', error);
        res.status(500).json({
          success: false,
          message: 'Internal server error',
        });
      }
    }
  };
};

export default asyncHandler;
