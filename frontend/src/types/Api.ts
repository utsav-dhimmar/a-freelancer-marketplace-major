export interface ApiError {
  message: string;
  success: boolean;
}

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  success: boolean;
  data: T;
}
