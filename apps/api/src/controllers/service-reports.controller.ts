
import type { Request, Response, NextFunction } from "express";
import type { Prisma } from "../generated/prisma/client.js";

import { AppError } from "../errors/app-error.js";
import { executeIdempotent } from "../services/idempotency.service.js";
import { createServiceReport } from "../services/service-reports.service.js";
import { createServiceReportSchema } from "../validators/service-reports.validator.js";
import {
  getServiceReports,
  getServiceReportById,
} from "../services/service-reports.service.js";

export async function createServiceReportController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // 1. Get authenticated user context.
    const auth = res.locals.auth;

    if (!auth) {
      throw new AppError(
        "Authentication required",
        401,
        "AUTHENTICATION_REQUIRED"
      );
    }

    // 2. Validate work-order ID.
    const workOrderId = req.params.workOrderId;

    if (
      typeof workOrderId !== "string" ||
      !workOrderId.trim()
    ) {
      throw new AppError(
        "Invalid work order ID",
        400,
        "INVALID_WORK_ORDER_ID"
      );
    }

    // 3. Validate idempotency key.
    const idempotencyKey = req.get("Idempotency-Key");

    if (
      !idempotencyKey ||
      idempotencyKey.length < 8 ||
      idempotencyKey.length > 128
    ) {
      throw new AppError(
        "A valid Idempotency-Key header is required",
        400,
        "INVALID_IDEMPOTENCY_KEY"
      );
    }

    // 4. Validate report body.
    const validation = createServiceReportSchema.safeParse(req.body);

    if (!validation.success) {
      throw new AppError(
        "Invalid service report data",
        400,
        "INVALID_SERVICE_REPORT"
      );
    }

    // 5. Execute the operation with idempotency protection.
    const result = await executeIdempotent({
      key: idempotencyKey,
      organizationId: auth.organizationId,
      userId: auth.userId,
      method: req.method,
      endpoint: `/api/v1/work-orders/${workOrderId}/reports`,
      payload: {
        workOrderId,
        notes: validation.data.notes,
      },

      operation: async (tx) => {
        const serviceReport = await createServiceReport(tx, {
          workOrderId,
          organizationId: auth.organizationId,
          technicianId: auth.userId,
          role: auth.role,
          notes: validation.data.notes,
        });

        // Convert Prisma dates and objects into JSON-safe data.
        const responseBody = JSON.parse(
          JSON.stringify({
            success: true,
            message: "Service report submitted successfully",
            data: serviceReport,
          })
        ) as Prisma.InputJsonValue;

        return {
          statusCode: 201,
          body: responseBody,
        };
      },
    });

    // 6. Indicate whether this response was replayed.
    res.setHeader(
      "Idempotency-Replayed",
      String(result.replayed)
    );

    // 7. Return the original or newly created response.
    res.status(result.statusCode).json(result.body);
  } catch (error) {
    next(error);
  }
}

export async function getServiceReportsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const auth = res.locals.auth;

    if (!auth) {
      throw new AppError(
        "Authentication required",
        401,
        "AUTHENTICATION_REQUIRED"
      );
    }

    const workOrderId = req.params.workOrderId;

    if (typeof workOrderId !== "string" || !workOrderId.trim()) {
      throw new AppError(
        "Invalid work order ID",
        400,
        "INVALID_WORK_ORDER_ID"
      );
    }

    const reports = await getServiceReports({
      workOrderId,
      organizationId: auth.organizationId,
      userId: auth.userId,
      role: auth.role,
    });

    res.status(200).json({
      success: true,
      message: "Service reports fetched successfully",
      data: reports,
    });
  } catch (error) {
    next(error);
  }
}

export async function getServiceReportByIdController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const auth = res.locals.auth;

    if (!auth) {
      throw new AppError(
        "Authentication required",
        401,
        "AUTHENTICATION_REQUIRED"
      );
    }

    const { workOrderId, reportId } = req.params;

    if (
      typeof workOrderId !== "string" ||
      !workOrderId.trim() ||
      typeof reportId !== "string" ||
      !reportId.trim()
    ) {
      throw new AppError(
        "Invalid report parameters",
        400,
        "INVALID_REPORT_PARAMETERS"
      );
    }

    const report = await getServiceReportById({
      workOrderId,
      reportId,
      organizationId: auth.organizationId,
      userId: auth.userId,
      role: auth.role,
    });

    res.status(200).json({
      success: true,
      message: "Service report fetched successfully",
      data: report,
    });
  } catch (error) {
    next(error);
  }
}
