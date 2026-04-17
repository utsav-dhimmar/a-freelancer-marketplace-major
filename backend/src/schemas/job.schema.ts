import { z } from 'zod';

export const createJobSchema = z.object({
  title: z
    .string({ error: 'Title is required' })
    .trim()
    .min(10, 'Title must have at least 10 characters')
    .max(100, 'Title cannot exceed 100 characters'),
  description: z
    .string({ error: 'Description is required' })
    .min(10, 'Description must have at least 10 characters'),
  difficulty: z.enum(['entry', 'intermediate', 'expert'], {
    error: 'Difficulty level is required',
  }),
  budget: z
    .number({ error: 'Budget is required' })
    .min(0, 'Budget cannot be negative'),
  budgetType: z.enum(['fixed', 'hourly'], {
    error: 'Budget type is required',
  }),
  skillsRequired: z
    .array(z.string())
    .min(1, 'At least one skill is required')
    .default([]),
  deadline: z.string({ error: 'Deadline is required' }),
});

export const updateJobSchema = createJobSchema.partial();

export type CreateJobInput = z.infer<typeof createJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;
