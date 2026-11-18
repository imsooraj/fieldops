
import type { AuthContext } from "./auth.types.js";

declare global {
  namespace Express {
    interface Locals {
      auth?: AuthContext;
    }
  }
}

export {};
