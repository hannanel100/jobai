import { z } from 'zod'
import { ApplicationSource, ApplicationStatus } from '@prisma/client'

const baseApplicationSchema = z.object({
  companyName: z.string().min(1, 'Company name is required').max(100, 'Company name is too long'),
  positionTitle: z.string().min(1, 'Position title is required').max(100, 'Position title is too long'),
  jobDescription: z.string().min(10, 'Job description must be at least 10 characters').max(5000, 'Job description is too long'),
  applicationDeadline: z.date().optional().nullable(),
  salaryMin: z.number().min(0, 'Minimum salary must be positive').optional().nullable(),
  salaryMax: z.number().min(0, 'Maximum salary must be positive').optional().nullable(),
  currency: z.string().default('USD'),
  companyWebsite: z.string().url('Invalid website URL').optional().nullable().or(z.literal('')),
  applicationSource: z.nativeEnum(ApplicationSource).optional().nullable(),
  notes: z.string().max(2000, 'Notes are too long').optional().nullable(),
  followUpDate: z.date().optional().nullable(),
  resumeId: z.string().optional().nullable(),
})

export const applicationSchema = baseApplicationSchema.refine((data) => {
  // If both salaryMin and salaryMax are provided, salaryMax should be >= salaryMin
  if (data.salaryMin && data.salaryMax) {
    return data.salaryMax >= data.salaryMin
  }
  return true
}, {
  message: 'Maximum salary must be greater than or equal to minimum salary',
  path: ['salaryMax'],
})

export type ApplicationFormData = z.infer<typeof applicationSchema>

// Create update schema from the base schema (without refine) and make it partial
export const applicationUpdateSchema = baseApplicationSchema.partial().refine((data) => {
  // If both salaryMin and salaryMax are provided, salaryMax should be >= salaryMin
  if (data.salaryMin && data.salaryMax) {
    return data.salaryMax >= data.salaryMin
  }
  return true
}, {
  message: 'Maximum salary must be greater than or equal to minimum salary',
  path: ['salaryMax'],
})

export type ApplicationUpdateData = z.infer<typeof applicationUpdateSchema>
