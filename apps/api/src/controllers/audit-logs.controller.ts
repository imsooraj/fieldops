
import type {
  Request,
  Response,
  NextFunction,
} from "express";

import {
  getWorkOrderAuditHistory,
} from "../services/audit-logs.service.js";

import {
  getWorkOrderAuditHistoryParamsSchema,
  getWorkOrderAuditHistoryQuerySchema,
} from "../validators/audit-logs.validator.js";

// GET /api/v1/work-orders/:workOrderId/audit-history
export async function getWorkOrderAuditHistoryController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // 1. Validate URL parameters.
    const paramsValidation =
      getWorkOrderAuditHistoryParamsSchema.safeParse(
        req.params
      );

    if (!paramsValidation.success) {
      res.status(400).json({
        success: false,
        message: "Invalid work order ID",
        errors: paramsValidation.error.flatten(),
      });
      return;
    }

    // 2. Validate pagination query parameters.
    const queryValidation =
      getWorkOrderAuditHistoryQuerySchema.safeParse(
        req.query
      );

    if (!queryValidation.success) {
      res.status(400).json({
        success: false,
        message: "Invalid query parameters",
        errors: queryValidation.error.flatten(),
      });
      return;
    }

    // 3. Get authenticated organization context.
    const organizationId =
      res.locals.auth?.organizationId;

    if (!organizationId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    // 4. Fetch audit history.
    const result = await getWorkOrderAuditHistory({
      workOrderId: paramsValidation.data.workOrderId,
      organizationId,
      page: queryValidation.data.page,
      limit: queryValidation.data.limit,
    });

    // 5. Return response.
    res.status(200).json({
      success: true,
      message: "Audit history fetched successfully",
      ...result,
    });
  } catch (error) {
    next(error);
  }
}
