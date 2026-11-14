import { Navigate, Outlet } from 'react-router-dom'
import { ApiError } from '../../lib/api-client'
import { useCurrentUser } from '../../features/auth/hooks/useCurrentUser'

function ProtectedRoute() {
  const {
    data: user,
    isPending,
    isError,
    error,
    refetch,
  } = useCurrentUser()

  if (isPending) {
    return <p>Checking your session...</p>
  }

  if (isError && error instanceof ApiError && error.status === 401) {
    return <Navigate to="/login" replace />
  }

  if (isError) {
    return (
      <div>
        <p>Unable to verify your session.</p>
        <button onClick={() => refetch()}>
          Try again
        </button>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default ProtectedRoute