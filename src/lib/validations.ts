import { z } from 'zod'

// Shared enum — mirrors the Prisma Status enum
export const StatusEnum = z.enum([
  'WISHLIST',
  'APPLIED',
  'PHONE_SCREEN',
  'INTERVIEW',
  'OFFER',
  'REJECTED',
])

// Schema used for creating a new application (POST)
export const createApplicationSchema = z.object({
  company:   z.string().min(1, 'Company name is required'),
  role:      z.string().min(1, 'Role is required'),
  status:    StatusEnum.default('WISHLIST'),
  jobUrl:    z.string().url('Must be a valid URL').optional().or(z.literal('')),
  location:  z.string().optional(),
  salary:    z.string().optional(),
  notes:     z.string().optional(),
  appliedAt: z.string().datetime({ offset: true }).optional().or(z.literal('')),
})

// Schema for partial updates (PATCH) — every field is optional
export const updateApplicationSchema = createApplicationSchema.partial()

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>
export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>
