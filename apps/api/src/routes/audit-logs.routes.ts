
import { Router } from "express";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/authorize-roles.middleware.js";
import {
  authorizeWorkOrderAssignment,
} from "../middleware/authorize-work-order-assignment.middleware.js";

import { ROLES } from "../constants/roles.js";

import {
  getWorkOrderAuditHistoryController,
} from "../controllers/audit-logs.controller.js";

const auditLogsRouter = Router();

// All audit-history endpoints require authentication.
auditLogsRouter.use(authenticate);

// Technician access requires an active work-order assignment.
auditLogsRouter.get(
  "/technician/:workOrderId/audit-history",
  authorizeRoles(ROLES.TECHNICIAN),
  authorizeWorkOrderAssignment,
  getWorkOrderAuditHistoryController
);

// Admin, dispatcher and manager access.
auditLogsRouter.get(
  "/:workOrderId/audit-history",
  authorizeRoles(
    ROLES.ADMIN,
    ROLES.DISPATCHER,
    ROLES.MANAGER
  ),
  getWorkOrderAuditHistoryController
);

export default auditLogsRouter;
