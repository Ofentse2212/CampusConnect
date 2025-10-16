import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './AuthProvider'

export function RequireAdmin() {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return null
  if (user && (user.role === 'admin' || user.role === 'staff')) return <Outlet />
  return <Navigate to="/auth" state={{ from: location }} replace />
}

export function RequireAuth() {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return null
  if (user) return <Outlet />
  return <Navigate to="/auth" state={{ from: location }} replace />
}


