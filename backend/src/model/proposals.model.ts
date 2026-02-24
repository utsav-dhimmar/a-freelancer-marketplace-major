import { Document, Model, model, Schema, Types } from 'mongoose';

export interface IProposal extends Document {
  job: Types.ObjectId;
  freelancer: Types.ObjectId;
  coverLetter: string;
  bidAmount: number;
  estimatedTime: string;
  status: 'pending' | 'shortlisted' | 'accepted' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const proposalSchema = new Schema<IProposal>(
  {
    job: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
      index: true,
    },
    freelancer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    coverLetter: {
      type: String,
      required: [true, 'Cover letter is required'],
      trim: true,
      minlength: [20, 'Cover letter must have at least 20 characters'],
    },
    bidAmount: {
      type: Number,
      required: [true, 'Bid amount is required'],
      min: [0, 'Bid amount cannot be negative'],
    },
    estimatedTime: {
      type: String,
      required: [true, 'Estimated time is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'shortlisted', 'accepted', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  },
);

// Ensure a freelancer can only submit one proposal per job
proposalSchema.index({ job: 1, freelancer: 1 }, { unique: true });

export const Proposal: Model<IProposal> = model<IProposal>(
  'Proposal',
  proposalSchema,
);
