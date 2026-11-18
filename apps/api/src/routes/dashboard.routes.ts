import { Router } from "express";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/authorize-roles.middleware.js";
import { ROLES } from "../constants/roles.js";

import { getDashboardSummaryController } from "../controllers/dashboard.controller.js";

const dashboardRouter = Router();

dashboardRouter.use(authenticate);

dashboardRouter.get(
  "/summary",
  authorizeRoles(
    ROLES.ADMIN,
    ROLES.DISPATCHER,
    ROLES.MANAGER
  ),
  getDashboardSummaryController
);

export default dashboardRouter;