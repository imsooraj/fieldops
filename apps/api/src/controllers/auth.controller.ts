
import type { Request, Response, NextFunction } from "express";
import { login } from "../services/auth.service.js";
import { loginSchema } from "../validators/auth.validator.js";
import { revokeSession } from "../services/sessions.service.js";

const SESSION_COOKIE_NAME = "fieldops_session";

export async function loginController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // 1. Validate incoming request data.
    const validation = loginSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Invalid login details",
        errors: validation.error.flatten().fieldErrors,
      });
      return;
    }

    // 2. Authenticate the user and create a session.
    const result = await login(validation.data);

    if (!result) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
      return;
    }

    // 3. Set the raw session token as an HttpOnly cookie.
    const isProduction = process.env.NODE_ENV === "production";

    res.cookie(SESSION_COOKIE_NAME, result.token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      expires: result.session.expiresAt,
    });

    // 4. Return safe account and organization information.
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: result.user,
        memberships: result.memberships,
        session: {
          id: result.session.id,
          expiresAt: result.session.expiresAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}


export async function logoutController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = req.cookies?.fieldops_session;

    // Revoke the database session if a cookie exists.
    if (token) {
      await revokeSession(token);
    }

    // Clear the browser cookie.
    const isProduction = process.env.NODE_ENV === "production";

    res.clearCookie("fieldops_session", {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
    });

    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    next(error);
  }
}

