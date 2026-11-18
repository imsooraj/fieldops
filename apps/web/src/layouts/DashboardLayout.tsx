import { useState } from "react";
import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { navigationItems } from "../app/navigation";
import { useCurrentUser } from "../features/auth/hooks/useCurrentUser";
import { logout } from "../features/auth/api/auth-api";

import "./DashboardLayout.css";

function NavigationIcon({
  name,
}: {
  name: "dashboard" | "work-orders";
}) {
  if (name === "dashboard") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  );
}

function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const { data: user } = useCurrentUser();

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      sessionStorage.removeItem("fieldops_organization_id");
      queryClient.clear();
      navigate("/login", { replace: true });
    },
  });

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error) {
      console.error("Unable to sign out:", error);
    }
  };

  const currentPage =
    navigationItems.find((item) => item.path === location.pathname)?.label ??
    "Workspace";

  const initials =
    user?.name
      ?.trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "U";

  return (
    <div className="dashboard-layout">
      {isSidebarOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          aria-label="Close navigation menu"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={`sidebar ${isSidebarOpen ? "sidebar-open" : ""}`}
      >
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">F</div>

          <div>
            <h2>FieldOps</h2>
            <span>Operations workspace</span>
          </div>

          <button
            type="button"
            className="sidebar-close-button"
            onClick={closeSidebar}
            aria-label="Close navigation"
          >
            ×
          </button>
        </div>

        <div className="sidebar-section-label">WORKSPACE</div>

        <nav className="sidebar-nav" aria-label="Main navigation">
          {navigationItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end
              onClick={closeSidebar}
              className={({ isActive }) =>
                `sidebar-nav-link ${isActive ? "active" : ""}`
              }
            >
              <span className="sidebar-nav-icon">
                <NavigationIcon name={item.icon} />
              </span>

              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-help">
            <span className="sidebar-help-icon">?</span>

            <div>
              <strong>Need assistance?</strong>
              <span>Contact your administrator</span>
            </div>
          </div>

          <div className="sidebar-version">FieldOps · v1.0</div>
        </div>
      </aside>

      <div className="main-section">
        <header className="topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="menu-button"
              aria-label="Open navigation menu"
              aria-expanded={isSidebarOpen}
              onClick={() => setIsSidebarOpen((previous) => !previous)}
            >
              <span />
              <span />
              <span />
            </button>

            <div className="topbar-breadcrumb">
              <span>Workspace</span>
              <span className="breadcrumb-separator">/</span>
              <strong>{currentPage}</strong>
            </div>
          </div>

          <div className="topbar-right">
            <div className="topbar-user">
              <div className="user-avatar">{initials}</div>

              <div className="user-details">
                <strong>{user?.name ?? "Loading..."}</strong>
                <span>{user?.role?.replaceAll("_", " ") ?? ""}</span>
              </div>
            </div>

            <button
              type="button"
              className="logout-button"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
            >
              {logoutMutation.isPending ? "Signing out..." : "Sign out"}
            </button>
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;