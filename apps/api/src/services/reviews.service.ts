
import {
  ReviewDecision,
  WorkOrderStatus,
} from "../generated/prisma/client.js";

import { prisma } from "../config/database.js";
import { AppError } from "../errors/app-error.js";

import { canTransitionWorkOrderStatus } from "../utils/work-order-workflow.js";
import { canRolePerformWorkOrderTransition } from "../utils/work-order-authorization.js";

interface CreateReviewInput {
  workOrderId: string;
  organizationId: string;
  reviewerId: string;
  role: string;
  decision: ReviewDecision;
  comments?: string;
}

export async function createReview(input: CreateReviewInput) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Find the work order within the organization.
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

      // 2. Find the latest submitted service report.
      const latestReport = await tx.serviceReport.findFirst({
        where: {
          workOrderId: workOrder.id,
        },
        orderBy: {
          version: "desc",
        },
        select: {
          id: true,
          version: true,
        },
      });

      if (!latestReport) {
        throw new AppError(
          "No service report found for this work order",
          404,
          "SERVICE_REPORT_NOT_FOUND"
        );
      }

      // 3. Map the review decision to the next work-order status.
      const nextStatus =
        input.decision === ReviewDecision.APPROVED
          ? WorkOrderStatus.APPROVED
          : WorkOrderStatus.REWORK;

      // 4. Validate the global workflow transition.
      const isValidTransition = canTransitionWorkOrderStatus(
        workOrder.status,
        nextStatus
      );

      if (!isValidTransition) {
        throw new AppError(
          "Work order is not available for review",
          409,
          "INVALID_WORK_ORDER_TRANSITION"
        );
      }

      // 5. Validate the reviewer's role.
      const isAuthorized = canRolePerformWorkOrderTransition(
        input.role,
        workOrder.status,
        nextStatus
      );

      if (!isAuthorized) {
        throw new AppError(
          "You are not authorized to review this work order",
          403,
          "WORK_ORDER_REVIEW_FORBIDDEN"
        );
      }

      // 6. Update only if the work order is still SUBMITTED.
      const updateResult = await tx.workOrder.updateMany({
        where: {
          id: workOrder.id,
          status: WorkOrderStatus.SUBMITTED,
          site: {
            customer: {
              organizationId: input.organizationId,
            },
          },
        },
        data: {
          status: nextStatus,
        },
      });

      if (updateResult.count === 0) {
        throw new AppError(
          "Work order was already reviewed or updated. Please refresh.",
          409,
          "WORK_ORDER_STATUS_CONFLICT"
        );
      }

      // 7. Create the review record.
      const review = await tx.review.create({
        data: {
          serviceReportId: latestReport.id,
          reviewerId: input.reviewerId,
          decision: input.decision,
          comments: input.comments,
        },
        include: {
          reviewer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          serviceReport: {
            select: {
              id: true,
              version: true,
              workOrderId: true,
            },
          },
        },
      });

      return {
        review,
        workOrderStatus: nextStatus,
      };
    });

    return result;
  } catch (error) {
    console.error("Failed to create work-order review:", error);

    if (
      error instanceof Error &&
      "code" in error &&
      error.code === "P2002"
    ) {
      throw new AppError(
        "This service report has already been reviewed",
        409,
        "SERVICE_REPORT_ALREADY_REVIEWED"
      );
    }

    throw error;
  }
}
