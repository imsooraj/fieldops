import type { Request, Response, NextFunction } from "express";

import { prisma } from "../config/database.js";
import { AppError } from "../errors/app-error.js";

export async function getCurrentUserController(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const auth = res.locals.auth;

    if (!auth) {
      throw new AppError(
        "Authentication required",
        401,
        "AUTHENTICATION_REQUIRED"
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: auth.userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        memberships: {
          where: {
            organizationId: auth.organizationId,
          },
          include: {
            organization: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!user || user.memberships.length === 0) {
      throw new AppError(
        "User membership not found",
        404,
        "MEMBERSHIP_NOT_FOUND"
      );
    }

    const membership = user.memberships[0];

    res.status(200).json({
      success: true,
      message: "Current user fetched successfully",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        membership: {
          organizationId: membership.organizationId,
          organizationName: membership.organization.name,
          role: membership.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}