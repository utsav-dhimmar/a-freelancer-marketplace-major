export class ApiError extends Error {
  statusCode: number;
  message: string;
  success: boolean;
  errors: string[];
  stack?: string;

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
    this.stack = stack;
  }
}

export class ApiResponse<T> {
  statusCode: number;
  message: string;
  success: boolean;
  data: T;


  constructor(
    statusCode: number,
    message: string,
    data: T,

  ) {
    this.statusCode = statusCode;
    this.message = message;
    this.success = true;
    this.data = data;

  }
}
