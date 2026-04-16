import { z } from 'zod';

export const createReviewSchema = z.object({
  contractId: z
    .string({ error: 'Contract ID is required' })
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid Contract ID format'),
  rating: z
    .number({ error: 'Rating is required' })
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating cannot exceed 5'),
  comment: z
    .string()
    .trim()
    .max(500, 'Comment cannot exceed 500 characters')
    .optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
