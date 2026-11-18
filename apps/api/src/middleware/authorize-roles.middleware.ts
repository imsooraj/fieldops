import type { RequestHandler } from "express";
import type { Role } from "../constants/roles.js";

export function authorizeRoles(...allowedRoles: Role[]): RequestHandler {
  return (_req, res, next) => {
    try {
      const auth = res.locals.auth;

      if (!auth) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
        });
        return;
      }

      if (!allowedRoles.includes(auth.role as Role)) {
        res.status(403).json({
          success: false,
          message: "You do not have permission to perform this action",
        });
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}