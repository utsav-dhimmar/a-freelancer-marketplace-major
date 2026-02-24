import type { NextFunction, Response } from 'express';
import { HTTP_STATUS } from '../constants/index.js';
import type { AuthRequest } from './auth.middleware.js';

type UserRole = 'client' | 'admin' | 'freelancer';

/**
 * Role-based authorization middleware
 * Restricts access to routes based on user roles
 * @param allowedRoles - Array of roles that can access the route
 */
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: `Access denied. Required roles: ${allowedRoles.join(', ')}`,
      });
      return;
    }

    next();
  };
};

/**
 * Admin only middleware
 */
export const adminOnly = authorize('admin');

/**
 * Freelancer only middleware
 */
export const freelancerOnly = authorize('freelancer');

/**
 * Client only middleware
 */
export const clientOnly = authorize('client');

/**
 * Admin or Freelancer middleware
 */
export const adminOrFreelancer = authorize('admin', 'freelancer');
