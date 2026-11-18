
import { prisma } from "../config/database.js";
import { AppError } from "../errors/app-error.js";
import type { Prisma } from "../generated/prisma/client.js";

// ============================================
// CREATE NOTIFICATION
// Called from a database transaction or worker
// ============================================

interface CreateNotificationInput {
  userId: string;
  type: string;
  payload: Prisma.InputJsonValue;
}

export async function createNotification(
  tx: Prisma.TransactionClient,
  input: CreateNotificationInput
) {
  try {
    const notification = await tx.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        payload: input.payload,
      },
    });

    return notification;
  } catch (error) {
    console.error("Failed to create notification:", error);
    throw error;
  }
}

// ============================================
// GET USER NOTIFICATIONS
// ============================================

interface GetNotificationsInput {
  userId: string;
  page: number;
  limit: number;
  unreadOnly: boolean;
}

export async function getNotifications(
  input: GetNotificationsInput
) {
  try {
    const { userId, page, limit, unreadOnly } = input;

    if (page < 1 || limit < 1 || limit > 100) {
      throw new AppError(
        "Invalid pagination parameters",
        400,
        "INVALID_PAGINATION"
      );
    }

    const skip = (page - 1) * limit;

    const where: Prisma.NotificationWhereInput = {
      userId,
      ...(unreadOnly && {
        readAt: null,
      }),
    };

    const [notifications, total, unreadCount] =
      await prisma.$transaction([
        prisma.notification.findMany({
          where,
          orderBy: [
            { createdAt: "desc" },
            { id: "desc" },
          ],
          skip,
          take: limit,
        }),

        prisma.notification.count({
          where,
        }),

        prisma.notification.count({
          where: {
            userId,
            readAt: null,
          },
        }),
      ]);

    return {
      data: notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    throw error;
  }
}

// ============================================
// MARK SINGLE NOTIFICATION AS READ
// ============================================

interface MarkNotificationAsReadInput {
  notificationId: string;
  userId: string;
}

export async function markNotificationAsRead(
  input: MarkNotificationAsReadInput
) {
  try {
    const { notificationId, userId } = input;

    const result = await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });

    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId,
      },
    });

    if (!notification) {
      throw new AppError(
        "Notification not found",
        404,
        "NOTIFICATION_NOT_FOUND"
      );
    }

    return notification;
  } catch (error) {
    console.error("Failed to mark notification as read:", error);
    throw error;
  }
}

// ============================================
// MARK ALL NOTIFICATIONS AS READ
// ============================================

export async function markAllNotificationsAsRead(
  userId: string
) {
  try {
    const result = await prisma.notification.updateMany({
      where: {
        userId,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });

    return {
      updatedCount: result.count,
    };
  } catch (error) {
    console.error("Failed to mark all notifications as read:", error);
    throw error;
  }
}
