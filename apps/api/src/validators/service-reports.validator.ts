
import { z } from "zod";

export const createServiceReportSchema = z.object({
  notes: z
    .string()
    .trim()
    .min(10, "Report notes must contain at least 10 characters")
    .max(5000, "Report notes cannot exceed 5000 characters"),
});

export type CreateServiceReportInput = z.infer<
  typeof createServiceReportSchema
>;
