
import type { RequestHandler } from "express";
import { prisma } from "../config/database.js";

export const authorizeWorkOrderAssignment: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const auth = res.locals.auth;

    if (!auth) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const workOrderId = req.params.workOrderId;

    if (
      typeof workOrderId !== "string" ||
      !workOrderId.trim()
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid work order ID",
      });
      return;
    }

    const assignment = await prisma.assignment.findFirst({
      where: {
        workOrderId,
        technicianId: auth.userId,
        status: {
          in: ["ASSIGNED", "ACCEPTED", "IN_PROGRESS"],
        },
        unassignedAt: null,
        workOrder: {
          site: {
            customer: {
              organizationId: auth.organizationId,
            },
          },
        },
      },
      select: {
        id: true,
      },
    });

    if (!assignment) {
      res.status(404).json({
        success: false,
        message: "Work order not found",
      });
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
};
