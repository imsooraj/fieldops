
import {
  Prisma,
  WorkOrderStatus,
  AssignmentStatus,
} from "../generated/prisma/client.js";
import { prisma } from "../config/database.js";

import { AppError } from "../errors/app-error.js";
import type { CreateServiceReportInput } from "../validators/service-reports.validator.js";

import { canTransitionWorkOrderStatus } from "../utils/work-order-workflow.js";
import { canRolePerformWorkOrderTransition } from "../utils/work-order-authorization.js";
import { createAuditLog } from "./audit-logs.service.js";

interface CreateServiceReportServiceInput {
  workOrderId: string;
  organizationId: string;
  technicianId: string;
  role: string;
  notes: CreateServiceReportInput["notes"];
}

interface GetServiceReportsInput {
  workOrderId: string;
  organizationId: string;
  userId: string;
  role: string;
}


export async function createServiceReport(
  tx: Prisma.TransactionClient,
  input: CreateServiceReportServiceInput
) {
  try {
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

    // 2. Verify that this technician has an active assignment.
    const assignment = await tx.assignment.findFirst({
      where: {
        workOrderId: workOrder.id,
        technicianId: input.technicianId,
        status: {
          in: [
            AssignmentStatus.ASSIGNED,
            AssignmentStatus.ACCEPTED,
            AssignmentStatus.IN_PROGRESS,
            AssignmentStatus.COMPLETED,
          ],
        },
        unassignedAt: null,
        workOrder: {
          site: {
            customer: {
              organizationId: input.organizationId,
            },
          },
        },
      },
      select: {
        id: true,
      },
    });

    if (!assignment) {
      throw new AppError(
        "You are not assigned to this work order",
        403,
        "WORK_ORDER_ASSIGNMENT_REQUIRED"
      );
    }

    // 3. Validate the current workflow status.
    const nextStatus = WorkOrderStatus.SUBMITTED;

    const isValidTransition = canTransitionWorkOrderStatus(
      workOrder.status,
      nextStatus
    );

    if (!isValidTransition) {
      throw new AppError(
        "Work order must be completed before submitting a report",
        409,
        "INVALID_WORK_ORDER_TRANSITION"
      );
    }

    // 4. Validate the technician's permission.
    const isAuthorized = canRolePerformWorkOrderTransition(
      input.role,
      workOrder.status,
      nextStatus
    );

    if (!isAuthorized) {
      throw new AppError(
        "You are not authorized to submit this report",
        403,
        "WORK_ORDER_TRANSITION_FORBIDDEN"
      );
    }

    // 5. Calculate the next report version.
    const latestReport = await tx.serviceReport.aggregate({
      where: {
        workOrderId: workOrder.id,
      },
      _max: {
        version: true,
      },
    });

    const nextVersion = (latestReport._max.version ?? 0) + 1;

    // 6. Update status only if it is still COMPLETED.
    const updateResult = await tx.workOrder.updateMany({
      where: {
        id: workOrder.id,
        status: WorkOrderStatus.COMPLETED,
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
        "Work order status changed. Please refresh and try again.",
        409,
        "WORK_ORDER_STATUS_CONFLICT"
      );
    }

    // 7. Create a new report version.
    const serviceReport = await tx.serviceReport.create({
      data: {
        workOrderId: workOrder.id,
        technicianId: input.technicianId,
        version: nextVersion,
        notes: input.notes,
      },
      include: {
        technician: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // 8. Create an audit record for report submission.
    await createAuditLog(tx, {
      organizationId: input.organizationId,
      actorId: input.technicianId,
      action: "SERVICE_REPORT_SUBMITTED",
      entityType: "SERVICE_REPORT",
      entityId: serviceReport.id,
      metadata: {
        workOrderId: workOrder.id,
        reportVersion: nextVersion,
        previousStatus: workOrder.status,
        newStatus: nextStatus,
      },
    });

    return {
      serviceReport,
      workOrderStatus: nextStatus,
    };
  } catch (error) {
    console.error("Failed to create service report:", error);
    throw error;
  }
}

async function validateReportAccess(
  input: GetServiceReportsInput
): Promise<void> {
  try {
    const workOrder = await prisma.workOrder.findFirst({
      where: {
        id: input.workOrderId,
        site: {
          customer: {
            organizationId: input.organizationId,
          },
        },
      },
      select: { id: true },
    });

    if (!workOrder) {
      throw new AppError(
        "Work order not found",
        404,
        "WORK_ORDER_NOT_FOUND"
      );
    }

    // Technicians can view reports only for work orders
    // assigned to them, including historical assignments.
    if (input.role === "TECHNICIAN") {
      const assignment = await prisma.assignment.findFirst({
        where: {
          workOrderId: input.workOrderId,
          technicianId: input.userId,
        },
        select: { id: true },
      });

      if (!assignment) {
        throw new AppError(
          "You are not authorized to view these reports",
          403,
          "REPORT_ACCESS_FORBIDDEN"
        );
      }
    }
  } catch (error) {
    console.error("Failed to validate report access:", error);
    throw error;
  }
}

export async function getServiceReports(
  input: GetServiceReportsInput
) {
  try {
    await validateReportAccess(input);

    const reports = await prisma.serviceReport.findMany({
      where: {
        workOrderId: input.workOrderId,
      },
      include: {
        technician: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        version: "desc",
      },
    });

    return reports;
  } catch (error) {
    console.error("Failed to fetch service reports:", error);
    throw error;
  }
}

export async function getServiceReportById(
  input: GetServiceReportsInput & {
    reportId: string;
  }
) {
  try {
    await validateReportAccess(input);

    const report = await prisma.serviceReport.findFirst({
      where: {
        id: input.reportId,
        workOrderId: input.workOrderId,
        workOrder: {
          site: {
            customer: {
              organizationId: input.organizationId,
            },
          },
        },
      },
      include: {
        technician: {
          select: {
            id: true,
            name: true,
          },
        },
        workOrder: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    });

    if (!report) {
      throw new AppError(
        "Service report not found",
        404,
        "SERVICE_REPORT_NOT_FOUND"
      );
    }

    return report;
  } catch (error) {
    console.error("Failed to fetch service report:", error);
    throw error;
  }
}
