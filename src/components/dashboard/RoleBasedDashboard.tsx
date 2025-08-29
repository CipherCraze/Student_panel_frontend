import { useAuth } from '../../contexts/AuthContext'
import { DashboardPage } from './DashboardPage'
import { SchoolAdminDashboard } from '../school-admin/SchoolAdminDashboard'

export function RoleBasedDashboard() {
  const { user } = useAuth()
  
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Route based on user role
  if (user.role === 'super_admin') {
    return <DashboardPage />
  } else if (user.role === 'school_admin') {
    return <SchoolAdminDashboard />
  }

  // Default fallback
  return <DashboardPage />
}