import { describe, it, expect, vi, beforeEach } from 'vitest';
import { User } from '../model/user.model.js';
import { UserService } from './user.service.js';

vi.mock('../model/user.model.js', () => ({
  User: {
    findOne: vi.fn(),
    findById: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    create: vi.fn(),
  },
}));

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    vi.clearAllMocks();
    userService = new UserService();
  });

  describe('findByEmail', () => {
    it('should find a user by email in lowercase', async () => {
      const email = 'Test@Example.com';
      const mockUser = { email: 'test@example.com' };
      vi.mocked(User.findOne).mockResolvedValue(mockUser);

      const result = await userService.findByEmail(email);

      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(result).toEqual(mockUser);
    });
  });

  describe('findByUsername', () => {
    it('should find a user by username', async () => {
      const username = 'testuser';
      const mockUser = { username };
      vi.mocked(User.findOne).mockResolvedValue(mockUser);

      const result = await userService.findByUsername(username);

      expect(User.findOne).toHaveBeenCalledWith({ username });
      expect(result).toEqual(mockUser);
    });
  });

  describe('emailExists', () => {
    it('should return true if email exists', async () => {
      vi.mocked(User.findOne).mockResolvedValue({ _id: '123' });
      const exists = await userService.emailExists('test@example.com');
      expect(exists).toBe(true);
    });

    it('should return false if email does not exist', async () => {
      vi.mocked(User.findOne).mockResolvedValue(null);
      const exists = await userService.emailExists('nonexistent@example.com');
      expect(exists).toBe(false);
    });
  });

  describe('findById', () => {
    it('should find user by ID', async () => {
      const userId = '123';
      vi.mocked(User.findById).mockResolvedValue({ _id: userId });
      const result = await userService.findById(userId);
      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(result?._id).toBe(userId);
    });
  });

  describe('findByIdSafe', () => {
    it('should find user by ID and exclude sensitive fields', async () => {
      const userId = '123';
      const mockQuery = {
        select: vi.fn().mockResolvedValue({ _id: userId }),
      };
      vi.mocked(User.findById).mockReturnValue(mockQuery as any);
      
      const result = await userService.findByIdSafe(userId);
      
      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(mockQuery.select).toHaveBeenCalledWith('-password -refreshToken');
      expect(result?._id).toBe(userId);
    });
  });

  describe('findByRefreshToken', () => {
    it('should find user by refresh token', async () => {
      const token = 'token-123';
      vi.mocked(User.findOne).mockResolvedValue({ _id: 'user-1' });
      const result = await userService.findByRefreshToken(token);
      expect(User.findOne).toHaveBeenCalledWith({ refreshToken: token });
      expect(result).toBeDefined();
    });
  });

  describe('usernameExists', () => {
    it('should return true if username exists', async () => {
      vi.mocked(User.findOne).mockResolvedValue({ _id: '123' });
      const exists = await userService.usernameExists('testuser');
      expect(exists).toBe(true);
    });
  });

  describe('updateRefreshToken', () => {
    it('should update refresh token for a user', async () => {
      const userId = 'user-123';
      const token = 'new-refresh-token';
      
      await userService.updateRefreshToken(userId, token);

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(userId, { refreshToken: token });
    });
  });

  describe('updateProfilePicture', () => {
    it('should update profile picture and return user without sensitive fields', async () => {
      const userId = 'user-123';
      const pic = 'http://example.com/pic.jpg';
      const mockQuery = {
        select: vi.fn().mockResolvedValue({ _id: userId, profilePicture: pic }),
      };
      vi.mocked(User.findByIdAndUpdate).mockReturnValue(mockQuery as any);

      const result = await userService.updateProfilePicture(userId, pic);

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        userId,
        { profilePicture: pic },
        { new: true }
      );
      expect(mockQuery.select).toHaveBeenCalledWith('-password -refreshToken');
      expect(result?.profilePicture).toBe(pic);
    });
  });
});
