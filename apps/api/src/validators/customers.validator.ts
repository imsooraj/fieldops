
import { z } from "zod";

export const createCustomerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Customer name must contain at least 2 characters")
    .max(150, "Customer name cannot exceed 150 characters"),

  email: z
    .string()
    .trim()
    .email("Please provide a valid email")
    .optional()
    .or(z.literal("")),

  phone: z
    .string()
    .trim()
    .max(20, "Phone number cannot exceed 20 characters")
    .optional()
    .or(z.literal("")),
});

export type CreateCustomerInput = z.infer<
  typeof createCustomerSchema
>;
