
import type { Request, Response, NextFunction } from "express";

import {
  getWorkOrders,
  getWorkOrderById,
  updateWorkOrderStatus,
} from "../services/work-orders.service.js";

import {
  getWorkOrdersQuerySchema,
  updateWorkOrderStatusSchema,
} from "../validators/work-orders.validator.js";

// GET /api/v1/work-orders
export async function getWorkOrdersController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const organizationId = res.locals.auth?.organizationId;

    if (!organizationId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const validation = getWorkOrdersQuerySchema.safeParse(req.query);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Invalid query parameters",
        errors: validation.error.flatten(),
      });
      return;
    }

    const result = await getWorkOrders(
      organizationId,
      validation.data
    );

    res.status(200).json({
      success: true,
      message: "Work orders fetched successfully",
      ...result,
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/v1/work-orders/:workOrderId
export async function getWorkOrderByIdController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const workOrderId = req.params.workOrderId;

    if (typeof workOrderId !== "string" || !workOrderId.trim()) {
      res.status(400).json({
        success: false,
        message: "Invalid work order ID",
      });
      return;
    }

    const organizationId = res.locals.auth?.organizationId;

    if (!organizationId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const workOrder = await getWorkOrderById(
      workOrderId,
      organizationId
    );

    if (!workOrder) {
      res.status(404).json({
        success: false,
        message: "Work order not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Work order fetched successfully",
      data: workOrder,
    });
  } catch (error) {
    next(error);
  }
}

// PATCH /api/v1/work-orders/:workOrderId/status
export async function updateWorkOrderStatusController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // 1. Get work-order ID from URL.
    const workOrderId = req.params.workOrderId;

    if (typeof workOrderId !== "string" || !workOrderId.trim()) {
      res.status(400).json({
        success: false,
        message: "Invalid work order ID",
      });
      return;
    }

    // 2. Get authenticated user context.
    const auth = res.locals.auth;

    if (!auth?.userId || !auth.organizationId || !auth.role) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    // 3. Validate request body.
    const validation = updateWorkOrderStatusSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Invalid work-order status",
        errors: validation.error.flatten(),
      });
      return;
    }

    // 4. Update work order and create audit record.
    const workOrder = await updateWorkOrderStatus({
      workOrderId,
      organizationId: auth.organizationId,
      actorId: auth.userId,
      role: auth.role,
      nextStatus: validation.data.nextStatus,
    });

    // 5. Return updated work order.
    res.status(200).json({
      success: true,
      message: "Work-order status updated successfully",
      data: workOrder,
    });
  } catch (error) {
    next(error);
  }
}
