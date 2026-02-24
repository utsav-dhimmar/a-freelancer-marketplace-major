/**
 * API Error class for consistent error handling
 * Can be used in both frontend and backend
 */
export class ApiError extends Error {
  statusCode: number;
  message: string;
  success: boolean;
  errors: string[];

  constructor(
    statusCode: number,
    message: string,
    errors: string[] = [],
    stack: string = '',
  ) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * API Response class for consistent success responses
 * Can be used in both frontend and backend
 */
export class ApiResponse<T> {
  statusCode: number;
  message: string;
  success: boolean;
  data: T;

  constructor(statusCode: number, message: string, data: T) {
    this.statusCode = statusCode;
    this.message = message;
    this.success = statusCode < 400;
    this.data = data;
  }
}
