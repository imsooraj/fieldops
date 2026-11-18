
import { z } from "zod";
import { ReviewDecision } from "../generated/prisma/client.js";

export const createReviewSchema = z.object({
  decision: z.enum(ReviewDecision),

  comments: z
    .string()
    .trim()
    .max(2000, "Review comments cannot exceed 2000 characters")
    .optional(),
});

export type CreateReviewInput = z.infer<
  typeof createReviewSchema
>;
