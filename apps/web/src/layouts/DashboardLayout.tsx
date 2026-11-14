import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'

import { navigationItems } from '../app/navigation'
import './DashboardLayout.css'

function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const closeSidebar = () => {
    setIsSidebarOpen(false)
  }

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
        className={`sidebar ${isSidebarOpen ? 'sidebar-open' : ''}`}
      >
        <h2 className="brand">FieldOps</h2>

        <nav className="sidebar-nav">
          {navigationItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeSidebar}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="main-section">
        <header className="topbar">
          <button
            type="button"
            className="menu-button"
            aria-label="Open navigation menu"
            aria-expanded={isSidebarOpen}
            onClick={() => setIsSidebarOpen((previous) => !previous)}
          >
            ☰
          </button>

          <h3>FieldOps</h3>
          <span>Administrator</span>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout