
import type { ErrorRequestHandler } from "express";
import { AppError } from "../errors/app-error.js";

const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _req,
  res,
  next
) => {
  try {
    if (res.headersSent) {
      next(error);
      return;
    }

    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
        code: error.code,
      });
      return;
    }

    console.error("Unexpected application error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
      code: "INTERNAL_SERVER_ERROR",
    });
  } catch (middlewareError) {
    next(middlewareError);
  }
};

export default errorHandler;
