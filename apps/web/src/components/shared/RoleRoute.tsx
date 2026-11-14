import { Navigate, Outlet } from 'react-router-dom'
import type { UserRole } from '../../features/auth/types/auth'
import { useCurrentUser } from '../../features/auth/hooks/useCurrentUser'

type RoleRouteProps = {
  allowedRoles: UserRole[]
}

function RoleRoute({ allowedRoles }: RoleRouteProps) {
  const { data: user, isPending, isError } = useCurrentUser()

  if (isPending) {
    return <p>Checking permissions...</p>
  }

  if (isError || !user) {
    return <Navigate to="/login" replace />
  }

  const hasPermission = allowedRoles.includes(user.role)

  if (!hasPermission) {
    return <Navigate to="/app/dashboard" replace />
  }

  return <Outlet />
}

export default RoleRoute