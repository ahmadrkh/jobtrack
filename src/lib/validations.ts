import { z } from 'zod'

export const StatusEnum = z.enum([
  'WISHLIST', 'APPLIED', 'PHONE_SCREEN', 'INTERVIEW', 'OFFER', 'REJECTED',
])

const isoDateOrEmpty = z.string().datetime({ offset: true }).optional().or(z.literal(''))

export const createApplicationSchema = z.object({
  company:    z.string().min(1, 'Company name is required'),
  role:       z.string().min(1, 'Role is required'),
  status:     StatusEnum.default('WISHLIST'),
  jobUrl:     z.string().url('Must be a valid URL').optional().or(z.literal('')),
  location:   z.string().optional(),
  salary:     z.string().optional(),
  notes:      z.string().optional(),
  appliedAt:  isoDateOrEmpty,
  followUpAt: isoDateOrEmpty,   // optional reminder date
})

export const updateApplicationSchema = createApplicationSchema.partial()

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>
export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>
