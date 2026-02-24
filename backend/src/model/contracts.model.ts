import { Document, Model, model, Schema, Types } from 'mongoose';

export interface IContract extends Document {
  job: Types.ObjectId;
  client: Types.ObjectId;
  freelancer: Types.ObjectId;
  proposal: Types.ObjectId;
  amount: number;
  status: 'active' | 'submitted' | 'completed' | 'disputed';
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const contractSchema = new Schema<IContract>(
  {
    job: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
      index: true,
    },
    client: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    freelancer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    proposal: {
      type: Schema.Types.ObjectId,
      ref: 'Proposal',
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Contract amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    status: {
      type: String,
      enum: ['active', 'submitted', 'completed', 'disputed'],
      default: 'active',
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

export const Contract: Model<IContract> = model<IContract>(
  'Contract',
  contractSchema,
);
