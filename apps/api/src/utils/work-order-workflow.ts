
import { WorkOrderStatus } from "../generated/prisma/client.js";

import { WORK_ORDER_TRANSITIONS } from "../constants/work-order-transitions.js";

export function canTransitionWorkOrderStatus(
  currentStatus: WorkOrderStatus,
  nextStatus: WorkOrderStatus
): boolean {
  try {
    const allowedTransitions = WORK_ORDER_TRANSITIONS[currentStatus];

    return allowedTransitions.includes(nextStatus);
  } catch (error) {
    console.error("Work order transition validation failed:", error);
    throw new Error("Unable to validate work order transition");
  }
}
