import { z } from 'zod'

export const workOrderSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must contain at least 3 characters')
    .max(100, 'Title cannot exceed 100 characters'),

  description: z
    .string()
    .min(10, 'Description must contain at least 10 characters'),

  priority: z.enum(['low', 'medium', 'high']),
})

export type WorkOrderFormValues = z.infer<typeof workOrderSchema>