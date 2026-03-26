import { z } from 'zod';

/**
 * Campaign status enum - must match database enum
 */
const CampaignStatus = z.enum(['draft', 'scheduled', 'sending', 'sent', 'failed']);

/**
 * Validation schema for creating a campaign
 */
export const createCampaignSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Campaign name is required').max(255),
    subject: z.string().min(1, 'Email subject is required').max(255),
    body: z.string().min(1, 'Email body is required'),
    scheduled_at: z
      .string()
      .datetime()
      .optional()
      .refine(
        (val) => {
          if (!val) return true; // optional field
          const scheduledDate = new Date(val);
          return scheduledDate > new Date();
        },
        { message: 'Scheduled date must be in the future' }
      ),
    recipient_ids: z
      .array(z.number().int().positive())
      .min(1, 'At least one recipient is required')
      .optional(), // Can be added later via campaign-recipients endpoint
  }),
});

/**
 * Validation schema for updating a campaign
 * All fields optional, but at least one must be provided
 */
export const updateCampaignSchema = z.object({
  body: z
    .object({
      name: z.string().min(1).max(255).optional(),
      subject: z.string().min(1).max(255).optional(),
      body: z.string().min(1).optional(),
      status: CampaignStatus.optional(),
      scheduled_at: z
        .string()
        .datetime()
        .optional()
        .refine(
          (val) => {
            if (!val) return true;
            const scheduledDate = new Date(val);
            return scheduledDate > new Date();
          },
          { message: 'Scheduled date must be in the future' }
        ),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided for update',
    }),
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Campaign ID must be a number'),
  }),
});

/**
 * Validation schema for getting a single campaign
 */
export const getCampaignSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Campaign ID must be a number'),
  }),
});

/**
 * Validation schema for deleting a campaign
 */
export const deleteCampaignSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Campaign ID must be a number'),
  }),
});

/**
 * Validation schema for listing campaigns with optional filters
 */
export const listCampaignsSchema = z.object({
  query: z.object({
    status: CampaignStatus.optional(),
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
  }),
});

/**
 * Validation schema for scheduling a campaign
 */
export const scheduleCampaignSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Campaign ID must be a number'),
  }),
  body: z.object({
    scheduled_at: z
      .string()
      .datetime()
      .refine(
        (val) => {
          const scheduledDate = new Date(val);
          return scheduledDate > new Date();
        },
        { message: 'Scheduled date must be in the future' }
      ),
  }),
});

/**
 * Validation schema for sending a campaign
 */
export const sendCampaignSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Campaign ID must be a number'),
  }),
});

/**
 * Validation schema for getting campaign stats
 */
export const getCampaignStatsSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Campaign ID must be a number'),
  }),
});

/**
 * Validation schema for getting campaign recipients
 */
export const getCampaignRecipientsSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Campaign ID must be a number'),
  }),
  query: z.object({
    limit: z
      .string()
      .regex(/^\d+$/)
      .transform(Number)
      .pipe(z.number().int().min(1).max(100))
      .optional()
      .default('50'),
    offset: z
      .string()
      .regex(/^\d+$/)
      .transform(Number)
      .pipe(z.number().int().min(0))
      .optional()
      .default('0'),
  }),
});
