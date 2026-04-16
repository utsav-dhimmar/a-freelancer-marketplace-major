import { z } from 'zod';

export const portfolioItemSchema = z.object({
  title: z
    .string({ error: 'Portfolio title is required' })
    .trim()
    .max(100, 'Portfolio title cannot exceed 100 characters'),
  link: z
    .string({ error: 'Portfolio link is required' })
    .url('Please enter a valid URL')
    .trim(),
  desc: z
    .string()
    .trim()
    .max(500, 'Portfolio description cannot exceed 500 characters')
    .optional(),
});

export const setupFreelancerSchema = z.object({
  title: z
    .string({ error: 'Professional title is required' })
    .trim()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title cannot exceed 100 characters'),
  bio: z
    .string({ error: 'Bio is required' })
    .trim()
    .min(20, 'Bio must be at least 20 characters')
    .max(2000, 'Bio cannot exceed 2000 characters'),
  skills: z
    .array(z.string())
    .min(1, 'At least one skill is required'),
  hourlyRate: z
    .number({ error: 'Hourly rate is required' })
    .min(1, 'Hourly rate must be at least 1'),
});

export const updateFreelancerSchema = setupFreelancerSchema.partial();

export const addPortfolioItemSchema = portfolioItemSchema;

export type SetupFreelancerInput = z.infer<typeof setupFreelancerSchema>;
export type UpdateFreelancerInput = z.infer<typeof updateFreelancerSchema>;
export type PortfolioItemInput = z.infer<typeof portfolioItemSchema>;
