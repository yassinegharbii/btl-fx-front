import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'
import type { Role } from '@/types/auth.types'

interface Props { roles: Role[] }

export function AuthGuard({ roles }: Props) {
  const { token, user } = useAuthStore()

  if (!token || !user)
    return <Navigate to="/login" replace />

  if (!roles.includes(user.role))
    return <Navigate to="/login" replace />

  return <Outlet />
}