import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import DashboardLayout from '../layouts/DashboardLayout'
import DashboardPage from '../features/dashboard/pages/DashboardPage'
import WorkOrdersPage from '../features/work-orders/pages/WorkOrdersPage'

import ProtectedRoute from '../components/shared/ProtectedRoute'
import RoleRoute from '../components/shared/RoleRoute'

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public route */}
        <Route path="/login" element={<div>Login Page</div>} />

        {/* Authentication required */}
        <Route element={<ProtectedRoute />}>
          <Route path="/app" element={<DashboardLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />

            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="work-orders" element={<WorkOrdersPage />} />

            {/* Admin and Manager only */}
            <Route element={<RoleRoute allowedRoles={['ADMIN', 'MANAGER']} />}>
              <Route
                path="admin/users"
                element={<div>User Management</div>}
              />
            </Route>
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/app/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter