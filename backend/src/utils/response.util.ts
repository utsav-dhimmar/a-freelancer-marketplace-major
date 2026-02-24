import type { Response } from 'express';

/**
 * API Response interface
 */
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T | undefined;
  error?: string | undefined;
}

/**
 * Send success response
 */
export const sendSuccess = <T>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T,
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
  };
  return res.status(statusCode).json(response);
};

/**
 * Send error response
 */
export const sendError = (
  res: Response,
  statusCode: number,
  message: string,
  error?: string,
): Response => {
  const response: ApiResponse<null> = {
    success: false,
    message,
    error,
  };
  return res.status(statusCode).json(response);
};
