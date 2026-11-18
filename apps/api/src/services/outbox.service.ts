
import type { Prisma } from "../generated/prisma/client.js";

interface CreateOutboxEventInput {
  eventType: string;
  payload: Prisma.InputJsonValue;
}

export async function createOutboxEvent(
  tx: Prisma.TransactionClient,
  input: CreateOutboxEventInput
) {
  try {
    return await tx.outboxEvent.create({
      data: {
        eventType: input.eventType,
        payload: input.payload,
      },
    });
  } catch (error) {
    console.error("Failed to create outbox event:", error);
    throw error;
  }
}
