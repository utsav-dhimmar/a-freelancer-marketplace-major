import { z } from 'zod';

export const registerSchema = z.object({
  username: z
    .string({ error: 'Username is required' })
    .trim()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username cannot exceed 30 characters'),
  fullname: z
    .string({ error: 'Full name is required' })
    .trim()
    .max(100, 'Full name cannot exceed 100 characters'),
  email: z
    .string({ error: 'Email is required' })
    .email('Please enter a valid email')
    .trim()
    .toLowerCase(),
  password: z
    .string({ error: 'Password is required' })
    .min(6, 'Password must be at least 6 characters'),
  role: z.enum(['client', 'admin', 'freelancer']).default('client'),
});

export const loginSchema = z.object({
  email: z
    .string({ error: 'Email is required' })
    .email('Please enter a valid email')
    .trim()
    .toLowerCase(),
  password: z
    .string({ error: 'Password is required' })
    .min(6, 'Password must be at least 6 characters'),
});

export const updateProfilePictureSchema = z.object({
  // Profile picture is handled by multer
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
