import { Router } from "express";

import {
  loginController,
  logoutController,
} from "../controllers/auth.controller.js";

import { getCurrentUserController } from "../controllers/current-user.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const authRouter = Router();

authRouter.post("/login", loginController);
authRouter.post("/logout", logoutController);

authRouter.get(
  "/me",
  authenticate,
  getCurrentUserController
);

export default authRouter;