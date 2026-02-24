import bcrypt from 'bcrypt';
import { Document, model, Schema, type Model } from 'mongoose';

/**
 * User document interface
 */
export interface IUser extends Document {
  username: string;
  fullname: string;
  email: string;
  password: string;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
  role: 'client' | 'admin' | 'freelancer';
  profilePicture: string;
  clientRating: number;
  clientReviewCount: number;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

/**
 * User schema definition
 */
const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
      index: true,
    },
    fullname: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [100, 'Full name cannot exceed 100 characters'],
      index: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      // match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    refreshToken: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ['client', 'admin', 'freelancer'],
      default: 'client',
    },
    profilePicture: {
      type: String,
      default: null,
      unique: true,
      index: true,
    },
    clientRating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot exceed 5'],
    },
    clientReviewCount: {
      type: Number,
      default: 0,
      min: [0, 'Review count cannot be negative'],
    },
  },
  {
    timestamps: true,
  },
);

/**
 * Hash password before saving
 */
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  const saltRounds = 10;
  this.password = await bcrypt.hash(this.password, saltRounds);
});

/**
 * Compare password method
 */
userSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * User model
 */
export const User: Model<IUser> = model<IUser>('User', userSchema);
