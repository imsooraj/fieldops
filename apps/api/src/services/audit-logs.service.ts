
import { prisma } from "../config/database.js";
import { AppError } from "../errors/app-error.js";
import type { Prisma } from "../generated/prisma/client.js";

// ============================================
// CREATE AUDIT LOG
// ============================================

interface CreateAuditLogInput {
  organizationId: string;
  actorId?: string | null;
  workOrderId?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Prisma.InputJsonValue;
}

export async function createAuditLog(
  tx: Prisma.TransactionClient,
  input: CreateAuditLogInput
) {
  try {
    return await tx.auditLog.create({
      data: {
        organizationId: input.organizationId,
        actorId: input.actorId ?? null,
        workOrderId: input.workOrderId ?? null,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        ...(input.metadata !== undefined && {
          metadata: input.metadata,
        }),
      },
    });
  } catch (error) {
    console.error("Failed to create audit log:", error);
    throw error;
  }
}

// ============================================
// GET WORK ORDER AUDIT HISTORY
// ============================================

interface GetWorkOrderAuditHistoryInput {
  workOrderId: string;
  organizationId: string;
  page: number;
  limit: number;
}

export async function getWorkOrderAuditHistory(
  input: GetWorkOrderAuditHistoryInput
) {
  try {
    // Validate pagination defensively.
    if (
      !Number.isInteger(input.page) ||
      input.page < 1 ||
      !Number.isInteger(input.limit) ||
      input.limit < 1 ||
      input.limit > 100
    ) {
      throw new AppError(
        "Invalid pagination parameters",
        400,
        "INVALID_PAGINATION"
      );
    }

    // 1. Verify work-order ownership.
    const workOrder = await prisma.workOrder.findFirst({
      where: {
        id: input.workOrderId,
        site: {
          customer: {
            organizationId: input.organizationId,
          },
        },
      },
      select: {
        id: true,
      },
    });

    if (!workOrder) {
      throw new AppError(
        "Work order not found",
        404,
        "WORK_ORDER_NOT_FOUND"
      );
    }

    // 2. Calculate pagination.
    const skip = (input.page - 1) * input.limit;

    // 3. Retrieve all events associated with this work order.
    const where: Prisma.AuditLogWhereInput = {
      organizationId: input.organizationId,
      workOrderId: input.workOrderId,
    };

    // 4. Fetch records and count together.
    const [auditLogs, totalRecords] = await prisma.$transaction([
      prisma.auditLog.findMany({
        where,
        include: {
          actor: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: [
          { createdAt: "desc" },
          { id: "desc" },
        ],
        skip,
        take: input.limit,
      }),

      prisma.auditLog.count({
        where,
      }),
    ]);

    // 5. Calculate pagination metadata.
    const totalPages = Math.ceil(
      totalRecords / input.limit
    );

    return {
      data: auditLogs,
      pagination: {
        totalRecords,
        currentPage: input.page,
        pageSize: input.limit,
        totalPages,
        hasNextPage: input.page < totalPages,
        hasPreviousPage: input.page > 1,
      },
    };
  } catch (error) {
    console.error(
      "Failed to fetch work-order audit history:",
      error
    );
    throw error;
  }
}
