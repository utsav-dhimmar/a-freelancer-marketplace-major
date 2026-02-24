import { Document, Model, model, Schema, Types } from 'mongoose';

export interface IJob extends Document {
  client: Types.ObjectId;
  title: string;
  description: string;
  difficulty: 'entry' | 'intermediate' | 'expert';
  budget: number;
  budgetType: 'fixed' | 'hourly';
  skillsRequired: string[];
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new Schema<IJob>(
  {
    client: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      minlength: [10, 'Title must have at least 10 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    difficulty: {
      type: String,
      enum: ['entry', 'intermediate', 'expert'],
      required: [true, 'Difficulty level is required'],
    },
    budget: {
      type: Number,
      required: [true, 'Budget is required'],
      min: [0, 'Budget cannot be negative'],
    },
    budgetType: {
      type: String,
      enum: ['fixed', 'hourly'],
      required: [true, 'Budget type is required'],
    },
    skillsRequired: {
      type: [String],
      default: [],
      index: true,
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'completed', 'cancelled'],
      default: 'open',
    },
  },
  {
    timestamps: true,
  },
);

export const Job: Model<IJob> = model<IJob>('Job', jobSchema);
