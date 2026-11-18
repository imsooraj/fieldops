
import { z } from "zod";

// GET /api/v1/notifications?page=1&limit=20&unreadOnly=true

export const getNotificationsQuerySchema = z.object({
  page: z.coerce.number()
    .int()
    .min(1)
    .default(1),

  limit: z.coerce.number()
    .int()
    .min(1)
    .max(100)
    .default(20),

  unreadOnly: z.enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
});

// PATCH /api/v1/notifications/:notificationId/read

export const notificationIdParamsSchema = z.object({
  notificationId: z.string()
    .trim()
    .min(1, "Notification ID is required"),
});

export type GetNotificationsQuery = z.infer<
  typeof getNotificationsQuerySchema
>;

export type NotificationIdParams = z.infer<
  typeof notificationIdParamsSchema
>;
