
import type {
  Request,
  Response,
  NextFunction,
} from "express";

import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../services/notifications.service.js";

import {
  getNotificationsQuerySchema,
  notificationIdParamsSchema,
} from "../validators/notifications.validator.js";

// ============================================
// GET NOTIFICATIONS
// GET /api/v1/notifications
// ============================================

export async function getNotificationsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = res.locals.auth?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const validation = getNotificationsQuerySchema.safeParse(
      req.query
    );

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Invalid query parameters",
        errors: validation.error.flatten(),
      });
      return;
    }

    const result = await getNotifications({
      userId,
      page: validation.data.page,
      limit: validation.data.limit,
      unreadOnly: validation.data.unreadOnly,
    });

    res.status(200).json({
      success: true,
      message: "Notifications fetched successfully",
      ...result,
    });
  } catch (error) {
    next(error);
  }
}

// ============================================
// MARK ONE NOTIFICATION AS READ
// PATCH /api/v1/notifications/:notificationId/read
// ============================================

export async function markNotificationAsReadController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = res.locals.auth?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const validation = notificationIdParamsSchema.safeParse(
      req.params
    );

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Invalid notification ID",
        errors: validation.error.flatten(),
      });
      return;
    }

    const notification = await markNotificationAsRead({
      notificationId: validation.data.notificationId,
      userId,
    });

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: notification,
    });
  } catch (error) {
    next(error);
  }
}

// ============================================
// MARK ALL NOTIFICATIONS AS READ
// PATCH /api/v1/notifications/read-all
// ============================================

export async function markAllNotificationsAsReadController(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = res.locals.auth?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const result = await markAllNotificationsAsRead(userId);

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
