import { z } from 'zod';

// Register validation schema
export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    name: z.string().min(1, 'Name is required').max(255, 'Name too long'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

// Login validation schema
export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
  }),
});

// Export types
export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
