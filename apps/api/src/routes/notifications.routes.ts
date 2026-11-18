
import { Router } from "express";

import { authenticate } from "../middleware/auth.middleware.js";

import {
  getNotificationsController,
  markNotificationAsReadController,
  markAllNotificationsAsReadController,
} from "../controllers/notifications.controller.js";

const notificationsRouter = Router();

// All notification endpoints require authentication.
notificationsRouter.use(authenticate);

// GET /api/v1/notifications
notificationsRouter.get(
  "/",
  getNotificationsController
);

// PATCH /api/v1/notifications/read-all
notificationsRouter.patch(
  "/read-all",
  markAllNotificationsAsReadController
);

// PATCH /api/v1/notifications/:notificationId/read
notificationsRouter.patch(
  "/:notificationId/read",
  markNotificationAsReadController
);

export default notificationsRouter;
