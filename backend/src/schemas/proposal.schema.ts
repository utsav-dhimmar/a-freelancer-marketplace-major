import { z } from 'zod';

export const createProposalSchema = z.object({
  jobId: z
    .string({ error: 'Job ID is required' })
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid Job ID format'),
  coverLetter: z
    .string({ error: 'Cover letter is required' })
    .trim()
    .min(20, 'Cover letter must have at least 20 characters'),
  bidAmount: z
    .number({ error: 'Bid amount is required' })
    .min(0, 'Bid amount cannot be negative'),
  estimatedTime: z
    .string({ error: 'Estimated time is required' })
    .trim(),
});

export const updateProposalStatusSchema = z.object({
  status: z.enum(['pending', 'shortlisted', 'accepted', 'rejected'], {
    error: 'Invalid status',
  }),
});

export type CreateProposalInput = z.infer<typeof createProposalSchema>;
