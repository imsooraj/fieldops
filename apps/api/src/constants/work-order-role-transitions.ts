
import { WorkOrderStatus } from "../generated/prisma/client.js";
import { ROLES, type Role } from "./roles.js";

export const WORK_ORDER_ROLE_TRANSITIONS: Partial<
    Record<
        Role,
        Partial<Record<WorkOrderStatus, readonly WorkOrderStatus[]>>
    >
> = {
    [ROLES.DISPATCHER]: {
        [WorkOrderStatus.CREATED]: [
            WorkOrderStatus.ASSIGNED,
            WorkOrderStatus.CANCELLED,
        ],
        [WorkOrderStatus.REOPENED]: [
            WorkOrderStatus.ASSIGNED,
        ],
    },

    [ROLES.TECHNICIAN]: {
  [WorkOrderStatus.ASSIGNED]: [WorkOrderStatus.ACCEPTED],
  [WorkOrderStatus.ACCEPTED]: [WorkOrderStatus.IN_PROGRESS],
  [WorkOrderStatus.IN_PROGRESS]: [
    WorkOrderStatus.ON_HOLD,
    WorkOrderStatus.COMPLETED,
  ],
  [WorkOrderStatus.ON_HOLD]: [WorkOrderStatus.IN_PROGRESS],
  [WorkOrderStatus.REWORK]: [WorkOrderStatus.IN_PROGRESS],

  // Add this transition
  [WorkOrderStatus.COMPLETED]: [WorkOrderStatus.SUBMITTED],
},

    [ROLES.MANAGER]: {
        [WorkOrderStatus.SUBMITTED]: [
            WorkOrderStatus.APPROVED,
            WorkOrderStatus.REWORK,
        ],
        [WorkOrderStatus.COMPLETED]: [
            WorkOrderStatus.REOPENED,
        ],
    },
};
