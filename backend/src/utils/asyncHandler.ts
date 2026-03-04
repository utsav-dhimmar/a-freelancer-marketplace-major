import type { NextFunction, Request, RequestHandler, Response } from 'express';

/**
 * Async handler wrapper to eliminate repeated try-catch blocks
 * Catches errors and passes them to the global error handler via next()
 */
const asyncHandler = (requestHandler: RequestHandler): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await requestHandler(req, res, next);
    } catch (error: any) {
      next(error);
    }
  };
};

export default asyncHandler;
