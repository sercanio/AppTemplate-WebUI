import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../auth/store/authStore'
import { Skeleton } from '../ui/skeleton'

interface PublicRouteProps {
  children: React.ReactNode
}

export default function PublicRoute({ children }: PublicRouteProps) {
  const { isAuthenticated, isInitialized } = useAuthStore()

  // Show loading skeleton while authentication is being initialized
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    )
  }

  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
