
import { z } from "zod";

export const getWorkOrderAuditHistoryParamsSchema = z.object({
  workOrderId: z.string().trim().min(1, "Work order ID is required"),
});

export const getWorkOrderAuditHistoryQuerySchema = z.object({
  page: z.coerce.number()
    .int()
    .min(1)
    .default(1),

  limit: z.coerce.number()
    .int()
    .min(1)
    .max(100)
    .default(20),
});

export type GetWorkOrderAuditHistoryParams = z.infer<
  typeof getWorkOrderAuditHistoryParamsSchema
>;

export type GetWorkOrderAuditHistoryQuery = z.infer<
  typeof getWorkOrderAuditHistoryQuerySchema
>;
