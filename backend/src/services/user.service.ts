import { User, type IUser } from '../model/user.model.js';

/**
 * User registration data
 */
export interface CreateUserData {
  username: string;
  fullname: string;
  email: string;
  password: string;
  role?: 'client' | 'admin' | 'freelancer';
  profilePicture: string;
}

export class UserService {
  /**
   * Create a new user
   */
  async createUser(data: CreateUserData): Promise<IUser> {
    const user = new User(data);
    await user.save();
    return user;
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email: email.toLowerCase() });
  }

  /**
   * Find user by username
   */
  async findByUsername(username: string): Promise<IUser | null> {
    return User.findOne({ username });
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<IUser | null> {
    return User.findById(id);
  }

  /**
   * Find user by ID without password
   */
  async findByIdSafe(id: string): Promise<IUser | null> {
    return User.findById(id).select('-password -refreshToken');
  }

  /**
   * Update user's refresh token
   */
  async updateRefreshToken(
    userId: string,
    token: string | null,
  ): Promise<void> {
    await User.findByIdAndUpdate(userId, { refreshToken: token });
  }

  /**
   * Find user by refresh token
   */
  async findByRefreshToken(token: string): Promise<IUser | null> {
    return User.findOne({ refreshToken: token });
  }

  /**
   * Check if email exists
   */
  async emailExists(email: string): Promise<boolean> {
    const user = await User.findOne({ email: email.toLowerCase() });
    return user !== null;
  }

  /**
   * Check if username exists
   */
  async usernameExists(username: string): Promise<boolean> {
    const user = await User.findOne({ username });
    return user !== null;
  }

  /**
   * Update user's profile picture
   */
  async updateProfilePicture(
    userId: string,
    profilePicture: string,
  ): Promise<IUser | null> {
    return User.findByIdAndUpdate(
      userId,
      { profilePicture },
      { new: true },
    ).select('-password -refreshToken');
  }
}

export const userService = new UserService();
