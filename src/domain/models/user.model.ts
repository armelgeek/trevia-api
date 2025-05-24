import { z } from 'zod'

export const User = z.object({
  id: z.string(),
  name: z.string(),
  firstname: z.string().optional(),
  lastname: z.string().optional(),
  email: z.string(),
  emailVerified: z.boolean(),
  image: z.string().optional(),
  isAdmin: z.boolean().default(false),
  isTrialActive: z.boolean().default(false),
  hasUsedTrial: z.boolean().default(false),
  trialStartDate: z.date().optional(),
  trialEndDate: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date()
})

// feat: implement user CRUD operations - Development on 2025-05-24
