import { Link } from "react-router-dom";

import { useDashboardSummary } from "../hooks/useDashboardSummary";
import type {
  RecentWorkOrder,
  WorkOrderStatus,
} from "../types/dashboard";

import "./DashboardPage.css";

const STATUS_LABELS: Record<WorkOrderStatus, string> = {
  CREATED: "Created",
  ASSIGNED: "Assigned",
  ACCEPTED: "Accepted",
  IN_PROGRESS: "In progress",
  ON_HOLD: "On hold",
  COMPLETED: "Completed",
  SUBMITTED: "Awaiting review",
  APPROVED: "Approved",
  REWORK: "Rework",
  CANCELLED: "Cancelled",
  REOPENED: "Reopened",
};

const STATUS_ORDER: WorkOrderStatus[] = [
  "CREATED",
  "ASSIGNED",
  "ACCEPTED",
  "IN_PROGRESS",
  "ON_HOLD",
  "COMPLETED",
  "SUBMITTED",
  "APPROVED",
  "REWORK",
  "CANCELLED",
  "REOPENED",
];

const ACTIVE_STATUSES: WorkOrderStatus[] = [
  "ASSIGNED",
  "ACCEPTED",
  "IN_PROGRESS",
  "ON_HOLD",
  "REWORK",
  "REOPENED",
];

function formatDate(value: string): string {
  try {
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(value));
  } catch (error) {
    console.error("Failed to format date:", error);
    return "—";
  }
}

function formatStatus(status: WorkOrderStatus): string {
  return STATUS_LABELS[status] ?? status.replaceAll("_", " ");
}

function StatusBadge({ status }: { status: WorkOrderStatus }) {
  return (
    <span className={`dashboard-status status-${status.toLowerCase()}`}>
      {formatStatus(status)}
    </span>
  );
}

function RecentWorkOrderRow({
  workOrder,
}: {
  workOrder: RecentWorkOrder;
}) {
  return (
    <tr>
      <td>
        <div className="recent-order-title">
          <strong>{workOrder.title}</strong>
          <span>#{workOrder.id.slice(0, 8)}</span>
        </div>
      </td>

      <td>
        <StatusBadge status={workOrder.status} />
      </td>

      <td>
        <span
          className={`dashboard-priority priority-${workOrder.priority.toLowerCase()}`}
        >
          {workOrder.priority}
        </span>
      </td>

      <td className="recent-order-date">
        {formatDate(workOrder.createdAt)}
      </td>
    </tr>
  );
}

function DashboardPage() {
  const { data, isPending, isError, error, refetch } =
    useDashboardSummary();

  if (isPending) {
    return (
      <div className="dashboard-loading" aria-live="polite">
        <div className="dashboard-loading-spinner" />
        <p>Loading your operations overview...</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="dashboard-error" role="alert">
        <h2>Unable to load dashboard</h2>
        <p>
          {error instanceof Error
            ? error.message
            : "Something went wrong while fetching dashboard data."}
        </p>

        <button type="button" onClick={() => refetch()}>
          Try again
        </button>
      </div>
    );
  }

  const activeCount = ACTIVE_STATUSES.reduce(
    (total, status) => total + (data.statusCounts[status] ?? 0),
    0
  );

  const reviewCount = data.statusCounts.SUBMITTED ?? 0;
  const approvedCount = data.statusCounts.APPROVED ?? 0;

  const statusRows = STATUS_ORDER.map((status) => ({
    status,
    count: data.statusCounts[status] ?? 0,
  })).filter((item) => item.count > 0);

  const maxStatusCount = Math.max(
    1,
    ...statusRows.map((item) => item.count)
  );

  return (
    <div className="dashboard-page">
      <header className="dashboard-heading">
        <div>
          <span className="dashboard-eyebrow">OVERVIEW</span>
          <h1>Dashboard</h1>
          <p>Monitor your field operations and work order activity.</p>
        </div>

        <Link
          to="/app/work-orders"
          className="dashboard-primary-action"
        >
          View work orders
          <span aria-hidden="true">→</span>
        </Link>
      </header>

      <section
        className="dashboard-stats"
        aria-label="Work order summary"
      >
        <article className="dashboard-stat-card">
          <div className="dashboard-stat-top">
            <span>Total work orders</span>
            <span className="dashboard-stat-icon icon-blue">▤</span>
          </div>
          <strong>{data.totalWorkOrders}</strong>
          <span className="dashboard-stat-description">
            All registered work orders
          </span>
        </article>

        <article className="dashboard-stat-card">
          <div className="dashboard-stat-top">
            <span>Active work orders</span>
            <span className="dashboard-stat-icon icon-orange">◷</span>
          </div>
          <strong>{activeCount}</strong>
          <span className="dashboard-stat-description">
            Currently being handled
          </span>
        </article>

        <article className="dashboard-stat-card">
          <div className="dashboard-stat-top">
            <span>Awaiting review</span>
            <span className="dashboard-stat-icon icon-purple">◉</span>
          </div>
          <strong>{reviewCount}</strong>
          <span className="dashboard-stat-description">
            Submitted for supervisor approval
          </span>
        </article>

        <article className="dashboard-stat-card">
          <div className="dashboard-stat-top">
            <span>Approved work orders</span>
            <span className="dashboard-stat-icon icon-green">✓</span>
          </div>
          <strong>{approvedCount}</strong>
          <span className="dashboard-stat-description">
            Approved and ready to close
          </span>
        </article>
      </section>

      <section className="dashboard-content-grid">
        <article className="dashboard-panel status-panel">
          <div className="dashboard-panel-heading">
            <div>
              <h2>Work order status</h2>
              <p>Distribution across current workflow stages</p>
            </div>
          </div>

          {statusRows.length === 0 ? (
            <div className="dashboard-empty">
              No work orders available yet.
            </div>
          ) : (
            <div className="status-list">
              {statusRows.map(({ status, count }) => (
                <div className="status-row" key={status}>
                  <div className="status-row-label">
                    <span>{formatStatus(status)}</span>
                    <strong>{count}</strong>
                  </div>

                  <div
                    className="status-track"
                    role="progressbar"
                    aria-label={`${formatStatus(status)} work orders`}
                    aria-valuemin={0}
                    aria-valuemax={maxStatusCount}
                    aria-valuenow={count}
                  >
                    <div
                      className={`status-bar bar-${status.toLowerCase()}`}
                      style={{
                        width: `${(count / maxStatusCount) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="dashboard-panel quick-actions-panel">
          <div className="dashboard-panel-heading">
            <div>
              <h2>Quick access</h2>
              <p>Jump into your daily operations</p>
            </div>
          </div>

          <Link to="/app/work-orders" className="quick-action-item">
            <span className="quick-action-icon">▤</span>
            <span>
              <strong>Work orders</strong>
              <small>View and track work orders</small>
            </span>
            <span className="quick-action-arrow">→</span>
          </Link>

          <div className="quick-action-item quick-action-disabled">
            <span className="quick-action-icon">◷</span>
            <span>
              <strong>Schedule</strong>
              <small>Coming in a future module</small>
            </span>
          </div>

          <div className="quick-action-item quick-action-disabled">
            <span className="quick-action-icon">⌖</span>
            <span>
              <strong>Assets</strong>
              <small>Coming in a future module</small>
            </span>
          </div>
        </article>
      </section>

      <section className="dashboard-panel recent-orders-panel">
        <div className="dashboard-panel-heading">
          <div>
            <h2>Recent work orders</h2>
            <p>The latest work orders created in your organization</p>
          </div>

          <Link to="/app/work-orders" className="dashboard-text-link">
            View all
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        {data.recentWorkOrders.length === 0 ? (
          <div className="dashboard-empty">
            No work orders have been created yet.
          </div>
        ) : (
          <div className="dashboard-table-wrapper">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Work order</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Created</th>
                </tr>
              </thead>

              <tbody>
                {data.recentWorkOrders.map((workOrder) => (
                  <RecentWorkOrderRow
                    key={workOrder.id}
                    workOrder={workOrder}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default DashboardPage;