import { Document, Model, model, Schema, Types } from 'mongoose';

export interface IMessage extends Document {
  contractId: Types.ObjectId;
  senderId: Types.ObjectId;
  senderName: string;
  message: string;
  readBy: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    contractId: {
      type: Schema.Types.ObjectId,
      ref: 'Contract',
      required: true,
      index: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    senderName: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    readBy: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Index for faster queries on contractId and sorting by timestamp
messageSchema.index({ contractId: 1, createdAt: -1 });

export const Message: Model<IMessage> = model<IMessage>(
  'Message',
  messageSchema,
);
