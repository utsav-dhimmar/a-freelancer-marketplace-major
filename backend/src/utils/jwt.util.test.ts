import { describe, it, expect, vi, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';
import { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken } from './jwt.util.js';
import { TOKEN } from '../constants/index.js';

vi.mock('jsonwebtoken');

describe('JWT Utilities', () => {
  const userId = 'user-123';
  const secret = 'test-secret';
  const refreshSecret = 'test-refresh-secret';

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = secret;
    process.env.JWT_REFRESH_SECRET = refreshSecret;
  });

  describe('generateAccessToken', () => {
    it('should generate an access token', () => {
      const mockToken = 'mock-access-token';
      vi.mocked(jwt.sign).mockReturnValue(mockToken as any);

      const token = generateAccessToken(userId);

      expect(token).toBe(mockToken);
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId },
        secret,
        { expiresIn: TOKEN.ACCESSTOKEN_MAX_AGE / 1000 }
      );
    });

    it('should throw error if JWT_SECRET is not defined', () => {
      delete process.env.JWT_SECRET;
      expect(() => generateAccessToken(userId)).toThrow('JWT_SECRET environment variable is not defined');
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a refresh token', () => {
      const mockToken = 'mock-refresh-token';
      vi.mocked(jwt.sign).mockReturnValue(mockToken as any);

      const token = generateRefreshToken(userId);

      expect(token).toBe(mockToken);
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId },
        refreshSecret,
        { expiresIn: TOKEN.REFRESHTOKEN_MAX_AGE / 1000 }
      );
    });

    it('should throw error if JWT_REFRESH_SECRET is not defined', () => {
      delete process.env.JWT_REFRESH_SECRET;
      expect(() => generateRefreshToken(userId)).toThrow('JWT_REFRESH_SECRET environment variable is not defined');
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify a valid access token', () => {
      const payload = { userId };
      vi.mocked(jwt.verify).mockReturnValue(payload as any);

      const result = verifyAccessToken('valid-token');

      expect(result).toEqual(payload);
      expect(jwt.verify).toHaveBeenCalledWith('valid-token', secret);
    });

    it('should return null for an invalid access token', () => {
      vi.mocked(jwt.verify).mockImplementation(() => {
        throw new Error('invalid token');
      });

      const result = verifyAccessToken('invalid-token');

      expect(result).toBeNull();
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify a valid refresh token', () => {
      const payload = { userId };
      vi.mocked(jwt.verify).mockReturnValue(payload as any);

      const result = verifyRefreshToken('valid-token');

      expect(result).toEqual(payload);
      expect(jwt.verify).toHaveBeenCalledWith('valid-token', refreshSecret);
    });

    it('should return null for an invalid refresh token', () => {
      vi.mocked(jwt.verify).mockImplementation(() => {
        throw new Error('invalid token');
      });

      const result = verifyRefreshToken('invalid-token');

      expect(result).toBeNull();
    });
  });
});
