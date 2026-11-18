export type WorkOrderStatus =
  | "CREATED"
  | "ASSIGNED"
  | "ACCEPTED"
  | "IN_PROGRESS"
  | "ON_HOLD"
  | "COMPLETED"
  | "SUBMITTED"
  | "APPROVED"
  | "REWORK"
  | "CANCELLED"
  | "REOPENED";

export type WorkOrderPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface RecentWorkOrder {
  id: string;
  title: string;
  status: WorkOrderStatus;
  priority: WorkOrderPriority;
  createdAt: string;
}

export interface DashboardSummary {
  totalWorkOrders: number;
  statusCounts: Partial<Record<WorkOrderStatus, number>>;
  recentWorkOrders: RecentWorkOrder[];
}

export interface DashboardSummaryResponse {
  success: boolean;
  message: string;
  data: DashboardSummary;
}