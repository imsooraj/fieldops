
import type {
  Request,
  Response,
  NextFunction,
} from "express";

import { createInvitationSchema } from "../validators/invitations.validator.js";
import { createInvitation } from "../services/invitations.service.js";

export async function createInvitationController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // 1. Read authenticated context.
    const auth = res.locals.auth;

    if (!auth) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    // 2. Only administrators can invite employees.
    if (auth.role !== "ADMIN") {
      res.status(403).json({
        success: false,
        message: "You are not authorized to invite employees",
      });
      return;
    }

    // 3. Validate request body.
    const validation = createInvitationSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Invalid invitation details",
        errors: validation.error.flatten().fieldErrors,
      });
      return;
    }

    // 4. Create invitation using authenticated identity.
    const result = await createInvitation({
      email: validation.data.email,
      role: validation.data.role,
      organizationId: auth.organizationId,
      invitedById: auth.userId,
    });

    // 5. Return invitation metadata.
    // Never expose the raw token in the API response.
    res.status(201).json({
      success: true,
      message: "Invitation created successfully",
      data: {
        id: result.invitation.id,
        email: result.invitation.email,
        role: result.invitation.role,
        expiresAt: result.invitation.expiresAt,
      },
    });
  } catch (error) {
    next(error);
  }
}
