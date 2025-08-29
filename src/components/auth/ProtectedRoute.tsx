import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { SparklesIcon } from '@heroicons/react/24/outline'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-primary-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-large mx-auto animate-pulse">
              <SparklesIcon className="w-8 h-8 text-white" />
            </div>
            <div className="absolute inset-0 w-16 h-16 bg-gradient-to-r from-primary-400 to-blue-400 rounded-2xl mx-auto animate-ping opacity-75"></div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
            <h2 className="text-xl font-bold gradient-text">Loading...</h2>
            <p className="text-secondary-600">Please wait while we load your dashboard</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
