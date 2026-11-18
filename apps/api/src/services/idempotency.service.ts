
import { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../config/database.js";
import { AppError } from "../errors/app-error.js";
import { generateRequestHash } from "../utils/request-hash.js";

interface IdempotencyResponse {
  statusCode: number;
  body: Prisma.InputJsonValue;
}

interface ExecuteIdempotentInput {
  key: string;
  organizationId: string;
  userId: string;
  method: string;
  endpoint: string;
  payload: unknown;

  operation: (
    tx: Prisma.TransactionClient
  ) => Promise<IdempotencyResponse>;
}

interface ExecuteIdempotentResult {
  statusCode: number;
  body: Prisma.JsonValue | Prisma.InputJsonValue;
  replayed: boolean;
}

function isUniqueConstraintError(error: unknown): boolean {
  try {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    );
  } catch (error) {
    console.error("Unique constraint error check failed:", error);
    return false;
  }
}

function validateExistingRecord(
  record: {
    requestHash: string;
    method: string;
    endpoint: string;
    status: string;
    responseStatus: number | null;
    responseBody: Prisma.JsonValue | null;
  },
  requestHash: string,
  method: string,
  endpoint: string
): ExecuteIdempotentResult {
  try {
    // The same key cannot represent a different request.
    if (
      record.requestHash !== requestHash ||
      record.method !== method ||
      record.endpoint !== endpoint
    ) {
      throw new AppError(
        "This idempotency key was already used for a different request",
        409,
        "IDEMPOTENCY_KEY_REUSED"
      );
    }

    // An existing operation is still being processed.
    if (record.status !== "COMPLETED") {
      throw new AppError(
        "This request is currently being processed. Please retry shortly.",
        409,
        "IDEMPOTENCY_REQUEST_IN_PROGRESS"
      );
    }

    if (
      record.responseStatus === null ||
      record.responseBody === null
    ) {
      throw new AppError(
        "The stored idempotency response is incomplete",
        500,
        "IDEMPOTENCY_RESPONSE_MISSING"
      );
    }

    return {
      statusCode: record.responseStatus,
      body: record.responseBody,
      replayed: true,
    };
  } catch (error) {
    throw error;
  }
}

export async function executeIdempotent(
  input: ExecuteIdempotentInput
): Promise<ExecuteIdempotentResult> {
  try {
    const requestHash = generateRequestHash(input.payload);

    try {
      return await prisma.$transaction(async (tx) => {
        // 1. Check whether this key already exists.
        const existingRecord = await tx.idempotencyRecord.findUnique({
          where: {
            organizationId_key: {
              organizationId: input.organizationId,
              key: input.key,
            },
          },
        });

        if (existingRecord) {
          // Expired keys can be reused after their record is removed.
          if (existingRecord.expiresAt <= new Date()) {
            await tx.idempotencyRecord.delete({
              where: {
                id: existingRecord.id,
              },
            });
          } else {
            return validateExistingRecord(
              existingRecord,
              requestHash,
              input.method,
              input.endpoint
            );
          }
        }

        // 2. Claim the new key.
        await tx.idempotencyRecord.create({
          data: {
            key: input.key,
            organizationId: input.organizationId,
            userId: input.userId,
            method: input.method,
            endpoint: input.endpoint,
            requestHash,
            status: "PROCESSING",
            expiresAt: new Date(
              Date.now() + 24 * 60 * 60 * 1000
            ),
          },
        });

        // 3. Execute the actual business operation.
        const operationResult = await input.operation(tx);

        // 4. Save the original response.
        await tx.idempotencyRecord.update({
          where: {
            organizationId_key: {
              organizationId: input.organizationId,
              key: input.key,
            },
          },
          data: {
            status: "COMPLETED",
            responseStatus: operationResult.statusCode,
            responseBody: operationResult.body,
          },
        });

        // 5. Return the original operation result.
        return {
          statusCode: operationResult.statusCode,
          body: operationResult.body,
          replayed: false,
        };
      });
    } catch (error) {
      // A concurrent request may have claimed the same key first.
      if (!isUniqueConstraintError(error)) {
        throw error;
      }

      // The failed transaction has ended. Read the record
      // using a fresh query outside that transaction.
      const existingRecord = await prisma.idempotencyRecord.findUnique({
        where: {
          organizationId_key: {
            organizationId: input.organizationId,
            key: input.key,
          },
        },
      });

      if (!existingRecord) {
        throw new AppError(
          "Unable to resolve the duplicate request",
          409,
          "IDEMPOTENCY_CONFLICT"
        );
      }

      return validateExistingRecord(
        existingRecord,
        requestHash,
        input.method,
        input.endpoint
      );
    }
  } catch (error) {
    console.error("Idempotency execution failed:", error);
    throw error;
  }
}
