import * as z from 'zod';

export const loginSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  email: z.email('Invalid email address'),
  fullname: z.string().trim().min(3, 'Fullname must be at least 3 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['client', 'freelancer']),
});

export const jobSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  skillsRequired: z.array(z.string()).min(1, 'At least one skill is required'),
  budgetType: z.enum(['fixed', 'hourly']),
  budgetAmount: z.number().min(1, 'Budget amount must be at least 1'),
  deadline: z.string().refine((date) => new Date(date) > new Date(), {
    message: 'Deadline must be in the future',
  }),
});

export const proposalSchema = z.object({
  coverLetter: z
    .string()
    .min(50, 'Cover letter must be at least 50 characters'),
  proposedAmount: z.number().min(1, 'Proposed amount must be at least 1'),
  estimatedDuration: z.number().min(1, 'Duration must be at least 1 day'),
});

export const freelancerSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  bio: z.string().min(20, 'Bio must be at least 20 characters'),
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
  hourlyRate: z.number().min(1, 'Hourly rate must be at least 1'),
});

export const portfolioItemSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  imageUrl: z.url().optional(),
  link: z.url().optional(),
});

export const contractWorkSchema = z.object({
  workDescription: z
    .string()
    .min(20, 'Work description must be at least 20 characters'),
});

export const disputeSchema = z.object({
  reason: z.string().min(20, 'Reason must be at least 20 characters'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type JobInput = z.infer<typeof jobSchema>;
export type ProposalInput = z.infer<typeof proposalSchema>;
export type FreelancerInput = z.infer<typeof freelancerSchema>;
export type PortfolioItemInput = z.infer<typeof portfolioItemSchema>;
export type ContractWorkInput = z.infer<typeof contractWorkSchema>;
export type DisputeInput = z.infer<typeof disputeSchema>;
