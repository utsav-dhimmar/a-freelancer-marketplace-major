import jwt from 'jsonwebtoken';
import { TOKEN } from '../constants/index.js';
export interface JwtPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

export const generateAccessToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not defined');
  }

  return jwt.sign({ userId }, secret, {
    expiresIn: TOKEN.ACCESSTOKEN_MAX_AGE / 1000,
  });
};

export const generateRefreshToken = (userId: string): string => {
  const refreshSecret = process.env.JWT_REFRESH_SECRET;
  if (!refreshSecret) {
    throw new Error('JWT_REFRESH_SECRET environment variable is not defined');
  }

  return jwt.sign({ userId }, refreshSecret, {
    expiresIn: TOKEN.REFRESHTOKEN_MAX_AGE / 1000,
  });
};

export const verifyAccessToken = (token: string): JwtPayload | null => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not defined');
  }

  try {
    return jwt.verify(token, secret) as JwtPayload;
  } catch {
    return null;
  }
};

export const verifyRefreshToken = (token: string): JwtPayload | null => {
  const refreshSecret = process.env.JWT_REFRESH_SECRET;
  if (!refreshSecret) {
    throw new Error('JWT_REFRESH_SECRET environment variable is not defined');
  }

  try {
    return jwt.verify(token, refreshSecret) as JwtPayload;
  } catch {
    return null;
  }
};
