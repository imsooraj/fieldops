
import { Router } from "express";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/authorize-roles.middleware.js";
import {
  authorizeWorkOrderAssignment,
} from "../middleware/authorize-work-order-assignment.middleware.js";

import { ROLES } from "../constants/roles.js";

import {
  getWorkOrderByIdController,
  getWorkOrdersController 
} from "../controllers/work-orders.controller.js";
import { createServiceReportController } from "../controllers/service-reports.controller.js";
import {
  getServiceReportsController,
  getServiceReportByIdController,
} from "../controllers/service-reports.controller.js";
import { createReviewController } from "../controllers/reviews.controller.js";
import {
  updateWorkOrderStatusController,
} from "../controllers/work-orders.controller.js";

const workOrdersRouter = Router();

// All work-order endpoints require authentication.
workOrdersRouter.use(authenticate);

workOrdersRouter.get(
  "/",
  authorizeRoles(ROLES.ADMIN, ROLES.DISPATCHER, ROLES.MANAGER),
  getWorkOrdersController
);

// GET /api/v1/work-orders/test-error
workOrdersRouter.get("/test-error", (_req, _res, next) => {
  try {
    const error = new Error("Demonstration error") as Error & {
      status: number;
    };

    error.status = 400;
    next(error);
  } catch (error) {
    next(error);
  }
});

// Technician-specific work-order access.
// Requires an active assignment.
workOrdersRouter.get(
  "/technician/:workOrderId",
  authorizeRoles(ROLES.TECHNICIAN),
  authorizeWorkOrderAssignment,
  getWorkOrderByIdController
);

workOrdersRouter.post(
  "/:workOrderId/reviews",
  authorizeRoles(ROLES.MANAGER, ROLES.ADMIN),
  createReviewController
);

workOrdersRouter.patch(
  "/:workOrderId/status",
  updateWorkOrderStatusController
);

// General work-order access.
// Technicians cannot bypass assignment verification.
workOrdersRouter.get(
  "/:workOrderId",
  authorizeRoles(
    ROLES.ADMIN,
    ROLES.DISPATCHER,
    ROLES.MANAGER
  ),
  getWorkOrderByIdController
);

workOrdersRouter.post(
  "/:workOrderId/reports",
  authorizeRoles(ROLES.TECHNICIAN),
  createServiceReportController
);

workOrdersRouter.get(
  "/:workOrderId/reports",
  getServiceReportsController
);

workOrdersRouter.get(
  "/:workOrderId/reports/:reportId",
  getServiceReportByIdController
);

// POST /api/v1/work-orders
// Existing placeholder implementation.
workOrdersRouter.post("/", (req, res, next) => {
  try {
    const { title, description, priority } = req.body;

    res.status(201).json({
      success: true,
      message: "Work order creation request received",
      data: {
        title,
        description,
        priority,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default workOrdersRouter;
