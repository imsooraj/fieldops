
import { z } from "zod";

export const getWorkOrdersQuerySchema = z.object({
  search: z.string().trim().optional(),

  status: z.enum([
    "CREATED",
    "ASSIGNED",
    "ACCEPTED",
    "IN_PROGRESS",
    "ON_HOLD",
    "COMPLETED",
    "SUBMITTED",
    "APPROVED",
    "REWORK",
    "CANCELLED",
    "REOPENED",
  ]).optional(),

  priority: z.enum([
    "LOW",
    "MEDIUM",
    "HIGH",
    "URGENT",
  ]).optional(),

  page: z.coerce.number()
    .int()
    .min(1)
    .default(1),

  limit: z.coerce.number()
    .int()
    .min(1)
    .max(100)
    .default(10),

  sortBy: z.enum([
    "createdAt",
    "updatedAt",
    "scheduledStart",
    "scheduledEnd",
    "title",
  ]).default("createdAt"),

  sortOrder: z.enum([
    "asc",
    "desc",
  ]).default("desc"),
});

export const updateWorkOrderStatusSchema = z.object({
  nextStatus: z.enum([
    "CREATED",
    "ASSIGNED",
    "ACCEPTED",
    "IN_PROGRESS",
    "ON_HOLD",
    "COMPLETED",
    "SUBMITTED",
    "APPROVED",
    "REWORK",
    "CANCELLED",
    "REOPENED",
  ]),
});

export type GetWorkOrdersQuery = z.infer<
  typeof getWorkOrdersQuerySchema
>;
