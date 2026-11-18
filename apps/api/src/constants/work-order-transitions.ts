
import { WorkOrderStatus } from "../generated/prisma/client.js";

export const WORK_ORDER_TRANSITIONS: Record<
    WorkOrderStatus,
    readonly WorkOrderStatus[]
> = {
    [WorkOrderStatus.CREATED]: [
        WorkOrderStatus.ASSIGNED,
        WorkOrderStatus.CANCELLED,
    ],

    [WorkOrderStatus.ASSIGNED]: [
        WorkOrderStatus.ACCEPTED,
        WorkOrderStatus.CANCELLED,
    ],

    [WorkOrderStatus.ACCEPTED]: [
        WorkOrderStatus.IN_PROGRESS,
        WorkOrderStatus.CANCELLED,
    ],

    [WorkOrderStatus.IN_PROGRESS]: [
        WorkOrderStatus.ON_HOLD,
        WorkOrderStatus.COMPLETED,
    ],

    [WorkOrderStatus.ON_HOLD]: [
        WorkOrderStatus.IN_PROGRESS,
        WorkOrderStatus.CANCELLED,
    ],

    [WorkOrderStatus.COMPLETED]: [
        WorkOrderStatus.SUBMITTED,
        WorkOrderStatus.REOPENED,
    ],

    [WorkOrderStatus.SUBMITTED]: [
        WorkOrderStatus.APPROVED,
        WorkOrderStatus.REWORK,
    ],

    [WorkOrderStatus.APPROVED]: [
        WorkOrderStatus.REOPENED,
    ],

    [WorkOrderStatus.REWORK]: [
        WorkOrderStatus.IN_PROGRESS,
        WorkOrderStatus.CANCELLED,
    ],

    [WorkOrderStatus.CANCELLED]: [],

    [WorkOrderStatus.REOPENED]: [
        WorkOrderStatus.ASSIGNED,
        WorkOrderStatus.CANCELLED,
    ],
};
