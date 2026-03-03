import type { ApiError } from './Api';
export type UserRole = 'client' | 'admin' | 'freelancer';

export interface User {
  _id: string;
  email: string;
  username: string;
  name?: string;
  role: UserRole;
  profilePicture?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSuccessResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export type AuthResponse = ApiError | AuthSuccessResponse;
