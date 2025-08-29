import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { ThemeToggle } from '../ui/ThemeToggle'
import { 
  HomeIcon, 
  AcademicCapIcon, 
  UserGroupIcon, 
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  SparklesIcon,
  Bars3Icon,
  XMarkIcon,
  TrophyIcon
} from '@heroicons/react/24/outline'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Role-based navigation
  const getNavigationForRole = () => {
    if (user?.role === 'super_admin') {
      return [
        { name: 'Dashboard', href: '/', icon: HomeIcon },
        { name: 'Schools', href: '/schools', icon: AcademicCapIcon },
        { name: 'Students', href: '/students', icon: UserGroupIcon },
        { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
        { name: 'Data Explorer', href: '/admin/data-explorer', icon: SparklesIcon },
        { name: 'Collections', href: '/admin/collections', icon: SparklesIcon },
        { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
      ]
    } else if (user?.role === 'school_admin') {
      return [
        { name: 'Dashboard', href: '/', icon: HomeIcon },
        { name: 'Student Management', href: '/student-management', icon: UserGroupIcon },
        { name: 'Leaderboard', href: '/leaderboard', icon: TrophyIcon },
        { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
        { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
      ]
    }
    return []
  }

  const navigation = getNavigationForRole()

  return (
    <div className="min-h-screen bg-transparent dark:bg-transparent">
      {/* Mobile menu overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-black/40 dark:backdrop-blur-lg border-b border-secondary-200/50 dark:border-white/10 shadow-lg">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-blue-600 rounded-lg flex items-center justify-center">
              <SparklesIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold gradient-text">SpeakGenie</h1>
              <p className="text-xs text-secondary-500 dark:text-secondary-300 font-medium">Admin Panel</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg text-secondary-600 dark:text-secondary-200 hover:bg-secondary-100/70 dark:hover:bg-white/5 transition-colors"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } bg-white dark:bg-black/30 dark:backdrop-blur-xl border-r border-secondary-200/50 dark:border-white/10 shadow-large`}>
        {/* Sidebar header */}
        <div className="flex h-20 items-center justify-between px-6 border-b border-secondary-200/50 dark:border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-blue-600 rounded-xl flex items-center justify-center">
              <SparklesIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">SpeakGenie</h1>
              <p className="text-xs text-secondary-500 dark:text-secondary-300 font-medium">Admin Panel</p>
            </div>
          </div>
          {/* Close button for mobile */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-lg text-secondary-500 dark:text-secondary-300 hover:bg-secondary-100 transition-colors dark:hover:bg-white/5"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="mt-8 px-6">
          <ul className="space-y-2">
            {navigation.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  onClick={() => setSidebarOpen(false)} // Close sidebar on mobile when clicking nav item
                  className={({ isActive }) =>
                    `group flex items-center rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-primary-600 to-blue-600 text-white shadow-lg'
                        : 'text-secondary-700 dark:text-secondary-200 hover:bg-secondary-100/80 dark:hover:bg-white/5 hover:text-secondary-900 dark:hover:text-white'
                    }`
                  }
                >
                  <item.icon className="mr-3 h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* User section */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-secondary-200/50 dark:border-white/10 bg-white dark:bg-black/30 dark:backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-primary-500 to-blue-500 flex items-center justify-center shadow-md">
                <span className="text-sm font-bold text-white">
                  {user?.name.charAt(0)}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-semibold text-secondary-900 dark:text-white">{user?.name}</p>
                <p className="text-xs text-secondary-500 dark:text-secondary-300 capitalize">
                  {user?.role === 'super_admin' ? 'Super Admin' : 'School Admin'}
                </p>
                {/* Removed hardcoded mock label to avoid fake data */}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-secondary-400 dark:text-secondary-300 hover:text-error-600 transition-all duration-200 hover:scale-110 p-2 rounded-lg hover:bg-error-50/70 dark:hover:bg-white/5"
              title="Logout"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72 pt-20 lg:pt-0">
        <main className="py-4 lg:py-8 animate-fade-in">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="hidden lg:flex items-center justify-end pb-4">
              <ThemeToggle />
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
