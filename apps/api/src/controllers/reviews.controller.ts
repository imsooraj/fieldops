
import type { Request, Response, NextFunction } from "express";

import { AppError } from "../errors/app-error.js";
import { createReview } from "../services/reviews.service.js";
import { createReviewSchema } from "../validators/reviews.validator.js";

export async function createReviewController(
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

    // 3. Validate request body.
    const validation = createReviewSchema.safeParse(req.body);

    if (!validation.success) {
      throw new AppError(
        "Invalid review data",
        400,
        "INVALID_REVIEW_DATA"
      );
    }

    // 4. Execute the review operation.
    const result = await createReview({
      workOrderId,
      organizationId: auth.organizationId,
      reviewerId: auth.userId,
      role: auth.role,
      decision: validation.data.decision,
      comments: validation.data.comments,
    });

    // 5. Return successful response.
    res.status(201).json({
      success: true,
      message: "Work order reviewed successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
