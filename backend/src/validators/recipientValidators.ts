import { z } from 'zod';

/**
 * Validation schema for creating a recipient
 */
export const createRecipientSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    name: z.string().min(1, 'Name is required').max(255),
  }),
});

/**
 * Validation schema for listing recipients with pagination
 */
export const listRecipientsSchema = z.object({
  query: z.object({
    limit: z
      .string()
      .regex(/^\d+$/)
      .transform(Number)
      .pipe(z.number().int().positive().max(100))
      .optional()
      .default('20'),
    offset: z
      .string()
      .regex(/^\d+$/)
      .transform(Number)
      .pipe(z.number().int().min(0))
      .optional()
      .default('0'),
    search: z.string().optional(), // Optional search by name or email
  }),
});

/**
 * Validation schema for getting a single recipient
 */
export const getRecipientSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Recipient ID must be a number'),
  }),
});
