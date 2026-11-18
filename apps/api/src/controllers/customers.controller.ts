
import type {
  Request,
  Response,
  NextFunction,
} from "express";

import {
  getCustomers,
  createCustomer,
} from "../services/customers.service.js";

import { createCustomerSchema } from "../validators/customers.validator.js";

export async function getCustomersController(
  _req: Request,
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

    const customers = await getCustomers(organizationId);

    res.status(200).json({
      success: true,
      data: customers,
    });
  } catch (error) {
    next(error);
  }
}

export async function createCustomerController(
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

    const validation = createCustomerSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Invalid customer details",
        errors: validation.error.flatten().fieldErrors,
      });
      return;
    }

    const customer = await createCustomer(
      validation.data,
      organizationId
    );

    res.status(201).json({
      success: true,
      message: "Customer created successfully",
      data: customer,
    });
  } catch (error) {
    next(error);
  }
}
