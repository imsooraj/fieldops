import express from "express";
import cookieParser from "cookie-parser";

import healthRouter from "./routes/health.routes.js";
import workOrdersRouter from "./routes/work-orders.routes.js";
import customersRouter from "./routes/customers.routes.js";
import authRouter from "./routes/auth.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";

import requestLogger from "./middleware/request-logger.middleware.js";
import notFoundHandler from "./middleware/not-found.middleware.js";
import errorHandler from "./middleware/error-handler.middleware.js";
import auditLogsRouter from "./routes/audit-logs.routes.js";
import notificationsRouter from "./routes/notifications.routes.js";

const app = express();

const PORT = Number(process.env.PORT) || 5000;

const allowedOrigin =
  process.env.WEB_ORIGIN || "http://localhost:5173";

// CORS middleware.
app.use((req, res, next) => {
  try {
    const origin = req.headers.origin;

    if (origin === allowedOrigin) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, PATCH, DELETE, OPTIONS"
      );
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, X-Organization-ID, Idempotency-Key"
      );
      res.setHeader("Vary", "Origin");
    }

    if (req.method === "OPTIONS") {
      res.sendStatus(204);
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Global middleware.
app.use(express.json());
app.use(cookieParser());
app.use(requestLogger);

// API routes.
app.use("/health", healthRouter);
app.use("/api/v1/work-orders", workOrdersRouter);
app.use("/api/v1/customers", customersRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/dashboard", dashboardRouter);
app.use("/api/v1/work-orders", auditLogsRouter);
app.use("/api/v1/notifications", notificationsRouter);

// Error handling.
app.use(notFoundHandler);
app.use(errorHandler);

async function startServer(): Promise<void> {
  try {
    const server = app.listen(PORT, () => {
      console.log(
        `FieldOps API running on http://localhost:${PORT}`
      );
    });

    server.on("error", (error) => {
      console.error("Server startup error:", error);
    });
  } catch (error) {
    console.error("Failed to start FieldOps API:", error);
    process.exitCode = 1;
  }
}

startServer();