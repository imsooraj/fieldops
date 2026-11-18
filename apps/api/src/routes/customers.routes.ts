import { Router } from "express";

import {
  getCustomersController,
  createCustomerController,
} from "../controllers/customers.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/authorize-roles.middleware.js";
import { ROLES } from "../constants/roles.js";

const router = Router();

// Every customer endpoint requires authentication.
router.use(authenticate);

// Only these roles can view the customer list.
router.get(
  "/",
  authorizeRoles(ROLES.ADMIN, ROLES.DISPATCHER, ROLES.MANAGER),
  getCustomersController
);

// Only Admin and Dispatcher can create customers.
router.post(
  "/",
  authorizeRoles(ROLES.ADMIN, ROLES.DISPATCHER),
  createCustomerController
);

export default router;