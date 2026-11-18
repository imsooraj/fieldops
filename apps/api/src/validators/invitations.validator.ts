
import { z } from "zod";

export const createInvitationSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Please provide a valid email address")
    .transform((email) => email.toLowerCase()),

  role: z
    .string()
    .trim()
    .min(1, "Role is required"),
});

export type CreateInvitationInput = z.infer<
  typeof createInvitationSchema
>;
