import * as z from 'zod';

export const loginSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  email: z.email('Invalid email address'),
  fullname: z.string().trim().min(3, 'Fullname must be at least 3 characters'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username cannot exceed 30 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['client', 'freelancer']),
  agreedToTerms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the terms and conditions',
  }),
});

export const jobSchema = z.object({
  title: z
    .string({ error: 'Title is required' })
    .min(10, 'Title must be at least 10 characters'),
  description: z
    .string({ error: 'Description is required' })
    .min(20, 'Description must be at least 20 characters'),
  skillsRequired: z
    .array(z.string())
    .min(1, 'At least one skill is required'),
  budgetType: z.enum(['fixed', 'hourly']),
  budgetAmount: z
    .number({ error: 'Budget amount is required' })
    .min(1, 'Budget amount must be at least 1'),
  difficulty: z.enum(['entry', 'intermediate', 'expert']),
  deadline: z
    .string({ error: 'Deadline is required' })
    .refine((date) => new Date(date) > new Date(), {
      message: 'Deadline must be in the future',
    }),
});

export const proposalSchema = z.object({
  coverLetter: z
    .string({ error: 'Cover letter is required' })
    .min(20, 'Cover letter must be at least 20 characters'),
  bidAmount: z
    .number({ error: 'Bid amount is required' })
    .min(1, 'Bid amount must be at least 1'),
  estimatedTime: z
    .string({ error: 'Estimated time is required' })
    .min(1, 'Estimated time is required'),
});

export const freelancerSchema = z.object({
  title: z
    .string({ error: 'Title is required' })
    .min(5, 'Title must be at least 5 characters'),
  bio: z
    .string({ error: 'Bio is required' })
    .min(20, 'Bio must be at least 20 characters'),
  skills: z
    .array(z.string())
    .min(1, 'At least one skill is required'),
  hourlyRate: z
    .number({ error: 'Hourly rate is required' })
    .min(1, 'Hourly rate must be at least 1'),
});

export const portfolioItemSchema = z.object({
  title: z
    .string({ error: 'Title is required' })
    .min(3, 'Title must be at least 3 characters'),
  description: z
    .string({ error: 'Description is required' })
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description cannot exceed 500 characters'),
  imageUrl: z
    .string({ error: 'Image URL is required' })
    .url('Please enter a valid image URL'),
  link: z
    .string({ error: 'Project link is required' })
    .url('Please enter a valid project link'),
});

export const contractWorkSchema = z.object({
  workDescription: z
    .string({ error: 'Work description is required' })
    .min(20, 'Work description must be at least 20 characters'),
});

export const disputeSchema = z.object({
  reason: z
    .string({ error: 'Reason is required' })
    .min(20, 'Reason must be at least 20 characters'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type JobInput = z.infer<typeof jobSchema>;
export type ProposalInput = z.infer<typeof proposalSchema>;
export type FreelancerInput = z.infer<typeof freelancerSchema>;
export type PortfolioItemInput = z.infer<typeof portfolioItemSchema>;
export type ContractWorkInput = z.infer<typeof contractWorkSchema>;
export type DisputeInput = z.infer<typeof disputeSchema>;
