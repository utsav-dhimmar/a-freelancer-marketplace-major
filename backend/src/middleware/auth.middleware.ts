import type { NextFunction, Request, Response } from 'express';
import { HTTP_STATUS } from '../constants/index.js';
import { User, type IUser } from '../model/user.model.js';
import { ApiError } from '../utils/ApiHelper.js';
import { verifyAccessToken } from '../utils/jwt.util.js';

/**
 * Extended Request interface with user property
 */
export interface AuthRequest extends Request {
  user?: IUser;
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(
        HTTP_STATUS.UNAUTHORIZED,
        'Access denied. No token provided.',
      );
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new ApiError(
        HTTP_STATUS.UNAUTHORIZED,
        'Access denied. No token provided.',
      );
    }

    const decoded = verifyAccessToken(token);
    if (!decoded) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid or expired token.');
    }

    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'User not found.');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }
    console.error('[AUTH] Middleware error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Internal server error.',
    });
  }
};
