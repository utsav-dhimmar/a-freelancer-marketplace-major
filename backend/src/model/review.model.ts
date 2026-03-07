import { Document, Model, Schema, Types, model } from 'mongoose';

/**
 * Review document interface
 */
export interface IReview extends Document {
  reviewer: Types.ObjectId;
  reviewee: Types.ObjectId;
  contract: Types.ObjectId;
  targetRole: 'client' | 'freelancer';
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Review schema definition
 */
const reviewSchema = new Schema<IReview>(
  {
    reviewer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reviewer is required'],
    },
    reviewee: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reviewee is required'],
    },
    contract: {
      type: Schema.Types.ObjectId,
      ref: 'Contract',
      required: [true, 'Contract is required'],
    },
    targetRole: {
      type: String,
      enum: ['client', 'freelancer'],
      required: [true, 'Target role is required'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [500, 'Comment cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  },
);

// Ensure a user can only review the other party once per contract
reviewSchema.index({ reviewer: 1, reviewee: 1, contract: 1 }, { unique: true });

/**
 * Review model
 */
export const Review: Model<IReview> = model<IReview>('Review', reviewSchema);
