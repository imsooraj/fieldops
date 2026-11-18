
import { WorkOrderStatus } from "../generated/prisma/client.js";
import { ROLES, type Role } from "../constants/roles.js";
import { WORK_ORDER_ROLE_TRANSITIONS } from "../constants/work-order-role-transitions.js";

export function canRolePerformWorkOrderTransition(
  role: string,
  currentStatus: WorkOrderStatus,
  nextStatus: WorkOrderStatus
): boolean {
  try {
    // ADMIN can perform every globally valid transition.
    if (role === ROLES.ADMIN) {
      return true;
    }

    // Reject unknown roles.
    if (!Object.values(ROLES).includes(role as Role)) {
      return false;
    }

    const allowedTransitions =
      WORK_ORDER_ROLE_TRANSITIONS[role as Role]?.[currentStatus] ?? [];

    return allowedTransitions.includes(nextStatus);
  } catch (error) {
    console.error("Work-order authorization failed:", error);
    throw new Error("Unable to authorize work-order transition");
  }
}
