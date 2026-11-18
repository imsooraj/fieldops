
import { prisma } from "../config/database.js";
import {
  WorkOrderStatus,
  Prisma,
} from "../generated/prisma/client.js";

import { canTransitionWorkOrderStatus } from "../utils/work-order-workflow.js";
import { canRolePerformWorkOrderTransition } from "../utils/work-order-authorization.js";
import { AppError } from "../errors/app-error.js";
import type { GetWorkOrdersQuery } from "../validators/work-orders.validator.js";
import { createAuditLog } from "./audit-logs.service.js";

// Fetch all work orders within an organization with filtering and pagination.
export async function getWorkOrders(
  organizationId: string,
  query: GetWorkOrdersQuery
) {
  try {
    const { search, status, priority, page, limit, sortBy, sortOrder } = query;

    // Calculate how many records should be skipped.
    const skip = (page - 1) * limit;

    // Build organization-scoped filters.
    const where: Prisma.WorkOrderWhereInput = {
      site: {
        customer: {
          organizationId,
        },
      },

      ...(status && {
        status,
      }),

      ...(priority && {
        priority,
      }),

      ...(search && {
        title: {
          contains: search,
          mode: "insensitive",
        },
      }),
    };

    // Build a type-safe sorting configuration.
    const orderBy: Prisma.WorkOrderOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    // Fetch records and total matching count concurrently.
    const [workOrders, totalRecords] = await prisma.$transaction([
      prisma.workOrder.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          site: {
            include: {
              customer: true,
            },
          },
          asset: true,
          assignments: true,
        },
      }),

      prisma.workOrder.count({
        where,
      }),
    ]);

    const totalPages = Math.ceil(totalRecords / limit);

    return {
      data: workOrders,
      pagination: {
        totalRecords,
        currentPage: page,
        pageSize: limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  } catch (error) {
    console.error("Failed to fetch work orders:", error);
    throw error;
  }
}

// Fetch a single work order within the authenticated organization.
export async function getWorkOrderById(
  workOrderId: string,
  organizationId: string
) {
  try {
    const workOrder = await prisma.workOrder.findFirst({
      where: {
        id: workOrderId,
        site: {
          customer: {
            organizationId,
          },
        },
      },
      include: {
        site: {
          include: {
            customer: true,
          },
        },
        asset: true,
        assignments: true,
      },
    });

    return workOrder;
  } catch (error) {
    console.error("Failed to fetch work order:", error);
    throw error;
  }
}

// Input required to update a work-order status.
interface UpdateWorkOrderStatusInput {
  workOrderId: string;
  organizationId: string;
  actorId: string;
  role: string;
  nextStatus: WorkOrderStatus;
}

// Update work-order status with workflow validation,
// role authorization and transaction safety.
export async function updateWorkOrderStatus(
  input: UpdateWorkOrderStatusInput
) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Find the work order inside the authenticated organization.
      const workOrder = await tx.workOrder.findFirst({
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
          status: true,
        },
      });

      if (!workOrder) {
        throw new AppError(
          "Work order not found",
          404,
          "WORK_ORDER_NOT_FOUND"
        );
      }

      // 2. Validate the overall workflow transition.
      const isValidTransition = canTransitionWorkOrderStatus(
        workOrder.status,
        input.nextStatus
      );

      if (!isValidTransition) {
        throw new AppError(
          "This work-order status transition is not allowed",
          409,
          "INVALID_WORK_ORDER_TRANSITION"
        );
      }

      // 3. Validate whether the user's role can perform this transition.
      const isAuthorized = canRolePerformWorkOrderTransition(
        input.role,
        workOrder.status,
        input.nextStatus
      );

      if (!isAuthorized) {
        throw new AppError(
          "You are not authorized to perform this transition",
          403,
          "WORK_ORDER_TRANSITION_FORBIDDEN"
        );
      }

      // 4. Update only if the status has not changed since we read it.
      const updateResult = await tx.workOrder.updateMany({
        where: {
          id: workOrder.id,
          status: workOrder.status,
        },
        data: {
          status: input.nextStatus,
        },
      });

      // 5. Create an audit record within the same transaction.
      await createAuditLog(tx, {
        organizationId: input.organizationId,
        actorId: input.actorId,
        action: "WORK_ORDER_STATUS_CHANGED",
        entityType: "WORK_ORDER",
        entityId: workOrder.id,
        metadata: {
          previousStatus: workOrder.status,
          newStatus: input.nextStatus,
        },
      });

      if (updateResult.count === 0) {
        throw new AppError(
          "Work order was updated by another request. Please refresh and try again.",
          409,
          "WORK_ORDER_STATUS_CONFLICT"
        );
      }

      // 5. Return the updated work order.
      return await tx.workOrder.findUnique({
        where: {
          id: workOrder.id,
        },
        include: {
          site: true,
          asset: true,
          assignments: true,
        },
      });
    });

    return result;
  } catch (error) {
    console.error("Failed to update work-order status:", error);
    throw error;
  }
}
