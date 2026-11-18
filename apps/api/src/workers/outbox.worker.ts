
import { prisma } from "../config/database.js";
import type { Prisma } from "../generated/prisma/client.js";

const MAX_ATTEMPTS = 5;
const BATCH_SIZE = 10;
const STALE_LOCK_MINUTES = 2;

interface NotificationEventPayload {
  userId: string;
  notificationType: string;
  notificationPayload: Prisma.InputJsonValue;
}

function isNotificationEventPayload(
  value: Prisma.JsonValue
): value is Prisma.JsonObject {
  try {
    if (
      typeof value !== "object" ||
      value === null ||
      Array.isArray(value)
    ) {
      return false;
    }

    const payload = value as Prisma.JsonObject;

    return (
      typeof payload.userId === "string" &&
      typeof payload.notificationType === "string" &&
      typeof payload.notificationPayload === "object" &&
      payload.notificationPayload !== null
    );
  } catch (error) {
    console.error("Failed to validate outbox payload:", error);
    return false;
  }
}

async function recoverStaleEvents(): Promise<void> {
  try {
    const staleBefore = new Date(
      Date.now() - STALE_LOCK_MINUTES * 60 * 1000
    );

    await prisma.outboxEvent.updateMany({
      where: {
        status: "PROCESSING",
        lockedAt: {
          lt: staleBefore,
        },
      },
      data: {
        status: "PENDING",
        lockedAt: null,
        availableAt: new Date(),
        lastError: "Worker lock expired; event returned to pending",
      },
    });
  } catch (error) {
    console.error("Failed to recover stale outbox events:", error);
    throw error;
  }
}

async function processOutboxEvent(eventId: string): Promise<void> {
  try {
    // Claim the event. Only one worker can change PENDING to PROCESSING.
    const claim = await prisma.outboxEvent.updateMany({
      where: {
        id: eventId,
        status: "PENDING",
        availableAt: {
          lte: new Date(),
        },
      },
      data: {
        status: "PROCESSING",
        lockedAt: new Date(),
        attempts: {
          increment: 1,
        },
      },
    });

    if (claim.count === 0) {
      return;
    }

    await prisma.$transaction(async (tx) => {
      const event = await tx.outboxEvent.findUnique({
        where: { id: eventId },
      });

      if (!event || event.status !== "PROCESSING") {
        throw new Error("Outbox event is no longer available");
      }

      if (event.eventType !== "WORK_ORDER_ASSIGNED") {
        throw new Error(`Unsupported event type: ${event.eventType}`);
      }

      if (!isNotificationEventPayload(event.payload)) {
        throw new Error("Invalid notification event payload");
      }

      const payload =
        event.payload as unknown as NotificationEventPayload;

      // Create the notification and complete the event
      // in the same transaction.
      await tx.notification.create({
        data: {
          userId: payload.userId,
          type: payload.notificationType,
          payload: payload.notificationPayload,
        },
      });

      await tx.outboxEvent.update({
        where: { id: event.id },
        data: {
          status: "COMPLETED",
          processedAt: new Date(),
          lockedAt: null,
          lastError: null,
        },
      });
    });

    console.log(`Outbox event processed: ${eventId}`);
  } catch (error) {
    console.error(`Outbox event failed: ${eventId}`, error);

    try {
      const event = await prisma.outboxEvent.findUnique({
        where: { id: eventId },
        select: { attempts: true },
      });

      if (!event) {
        return;
      }

      const permanentlyFailed = event.attempts >= MAX_ATTEMPTS;

      // Exponential backoff: 2s, 4s, 8s, 16s...
      const retryDelay = Math.min(
        1000 * 2 ** event.attempts,
        60 * 60 * 1000
      );

      await prisma.outboxEvent.updateMany({
        where: {
          id: eventId,
          status: "PROCESSING",
        },
        data: {
          status: permanentlyFailed ? "FAILED" : "PENDING",
          availableAt: new Date(Date.now() + retryDelay),
          lockedAt: null,
          lastError:
            error instanceof Error
              ? error.message
              : "Unknown processing error",
        },
      });
    } catch (retryError) {
      console.error("Failed to schedule outbox retry:", retryError);
    }
  }
}

export async function processPendingOutboxEvents(): Promise<void> {
  try {
    await recoverStaleEvents();

    const events = await prisma.outboxEvent.findMany({
      where: {
        status: "PENDING",
        availableAt: {
          lte: new Date(),
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      take: BATCH_SIZE,
      select: {
        id: true,
      },
    });

    for (const event of events) {
      await processOutboxEvent(event.id);
    }
  } catch (error) {
    console.error("Outbox worker failed:", error);
  }
}
