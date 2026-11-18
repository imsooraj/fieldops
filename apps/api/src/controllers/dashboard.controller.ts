import type { Request, Response, NextFunction } from "express";

import { getDashboardSummary } from "../services/dashboard.service.js";

export async function getDashboardSummaryController(
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

    const summary = await getDashboardSummary(organizationId);

    res.status(200).json({
      success: true,
      message: "Dashboard summary fetched successfully",
      data: summary,
    });
  } catch (error) {
    next(error);
  }
}