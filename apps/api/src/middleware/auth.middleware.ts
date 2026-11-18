
import type {
  Request,
  Response,
  NextFunction,
} from "express";

import { prisma } from "../config/database.js";
import { hashToken } from "../utils/secure-token.js";

const SESSION_COOKIE_NAME = "fieldops_session";

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // 1. Read the session token from the browser cookie.
    const token = req.cookies?.[SESSION_COOKIE_NAME];

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    // 2. Hash the token before searching the database.
    const tokenHash = hashToken(token);

    // 3. Find the session and associated user memberships.
    const session = await prisma.session.findUnique({
      where: {
        tokenHash,
      },
      include: {
        user: {
          include: {
            memberships: true,
          },
        },
      },
    });

    if (!session) {
      res.status(401).json({
        success: false,
        message: "Invalid session",
      });
      return;
    }

    // 4. Check whether the session is revoked or expired.
    if (
      session.revokedAt ||
      session.expiresAt <= new Date()
    ) {
      res.status(401).json({
        success: false,
        message: "Session expired or revoked",
      });
      return;
    }

    // 5. Check whether the user account is active.
    if (session.user.status !== "ACTIVE") {
      res.status(403).json({
        success: false,
        message: "User account is inactive",
      });
      return;
    }

    // 6. Check organization memberships.
    const memberships = session.user.memberships;

    if (memberships.length === 0) {
      res.status(403).json({
        success: false,
        message: "No organization membership found",
      });
      return;
    }

    // 7. Resolve the active organization.
    const requestedOrganizationId =
      req.headers["x-organization-id"];

    if (
      Array.isArray(requestedOrganizationId)
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid organization selection",
      });
      return;
    }

    let selectedMembership;

    if (requestedOrganizationId) {
      selectedMembership = memberships.find(
        (membership) =>
          membership.organizationId === requestedOrganizationId
      );

      if (!selectedMembership) {
        res.status(403).json({
          success: false,
          message: "You do not belong to this organization",
        });
        return;
      }
    } else if (memberships.length === 1) {
      selectedMembership = memberships[0];
    } else {
      res.status(400).json({
        success: false,
        message: "Organization selection required",
      });
      return;
    }

    // 8. Attach authenticated context to the response.
    res.locals.auth = {
      userId: session.user.id,
      organizationId: selectedMembership.organizationId,
      role: selectedMembership.role,
    };

    next();
  } catch (error) {
    console.error("Authentication middleware failed:", error);
    next(error);
  }
}
