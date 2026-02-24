import mongoose, { Document, Schema, Types, type Model } from 'mongoose';

/**
 * Portfolio item interface
 */
export interface IPortfolioItem {
  title: string;
  link: string;
  desc: string;
}

/**
 * Freelancer document interface
 */
export interface IFreelancer extends Document {
  user: Types.ObjectId;
  title: string;
  bio: string;
  skills: string[];
  hourlyRate: number;
  portfolio: IPortfolioItem[];
  rating: number;
  reviewCount: number;
  totalJobs: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Portfolio item schema
 */
const portfolioItemSchema = new Schema<IPortfolioItem>(
  {
    title: {
      type: String,
      required: [true, 'Portfolio title is required'],
      trim: true,
      maxlength: [100, 'Portfolio title cannot exceed 100 characters'],
    },
    link: {
      type: String,
      required: [true, 'Portfolio link is required'],
      trim: true,
    },
    desc: {
      type: String,
      trim: true,
      maxlength: [500, 'Portfolio description cannot exceed 500 characters'],
    },
  },
  { _id: false },
);

/**
 * Freelancer schema definition
 */
const freelancerSchema = new Schema<IFreelancer>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Professional title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
      index: true,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [2000, 'Bio cannot exceed 2000 characters'],
    },
    skills: {
      type: [String],
      default: [],
      index: true,
    },
    hourlyRate: {
      type: Number,
      required: [true, 'Hourly rate is required'],
      min: [0, 'Hourly rate cannot be negative'],
    },
    portfolio: {
      type: [portfolioItemSchema],
      default: [],
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot exceed 5'],
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: [0, 'Review count cannot be negative'],
    },
    totalJobs: {
      type: Number,
      default: 0,
      min: [0, 'Total jobs cannot be negative'],
    },
  },
  {
    timestamps: true,
  },
);

/**
 * Freelancer model
 */
export const Freelancer: Model<IFreelancer> = mongoose.model<IFreelancer>(
  'Freelancer',
  freelancerSchema,
);
