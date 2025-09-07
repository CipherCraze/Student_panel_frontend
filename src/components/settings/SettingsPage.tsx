import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { useAuth } from '../../contexts/AuthContext'
import { User } from 'lucide-react'

export function SettingsPage() {
  const { user } = useAuth()
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Settings
            </CardTitle>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-secondary-300 mt-1">
              Update your personal information and contact details
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input 
                label="Full Name" 
                defaultValue={user?.name || 'Not provided'} 
                readOnly 
              />
              <Input 
                label="Email" 
                type="email" 
                defaultValue={user?.email || 'Not provided'} 
                readOnly 
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-secondary-200 mb-1">
                  Role
                </label>
                <div className="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-md bg-gray-50 dark:bg-black/20 text-secondary-900 dark:text-white">
                  {user?.role === 'super_admin' ? 'Super Administrator' : 
                   user?.role === 'school_admin' ? 'School Administrator' : 
                   user?.role || 'Not assigned'}
                </div>
              </div>
              {user?.schoolId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-secondary-200 mb-1">
                    School ID
                  </label>
                  <div className="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-md bg-gray-50 dark:bg-black/20 text-secondary-900 dark:text-white">
                    {user.schoolId}
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-secondary-200 mb-1">
                  Onboarding Status
                </label>
                <div className={`w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-md text-secondary-900 dark:text-white ${
                  user?.onboardingCompleted ? 'bg-green-50 dark:bg-green-900/20' : 'bg-yellow-50 dark:bg-yellow-900/20'
                }`}>
                  {user?.onboardingCompleted ? '✅ Completed' : '⏳ Pending'}
                </div>
              </div>
              <Button disabled>Update Profile (Read Only)</Button>
            </div>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Account Information</CardTitle>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-secondary-300 mt-1">
              View your account details and current session
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-secondary-200 mb-1">
                  User ID
                </label>
                <div className="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-md bg-gray-50 dark:bg-black/20 text-secondary-900 dark:text-white font-mono text-sm">
                  {user?.id || 'Not available'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-secondary-200 mb-1">
                  Account Type
                </label>
                <div className="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-md bg-gray-50 dark:bg-black/20 text-secondary-900 dark:text-white">
                  {user?.role === 'super_admin' ? 'System Administrator' : 
                   user?.role === 'school_admin' ? 'School Administrator' : 
                   'Standard User'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-secondary-200 mb-1">
                  Login Status
                </label>
                <div className="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-md bg-green-50 dark:bg-green-900/20 text-secondary-900 dark:text-white">
                  🟢 Currently logged in
                </div>
              </div>
              {user?.role === 'school_admin' && user.schoolId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-secondary-200 mb-1">
                    Managed School
                  </label>
                  <div className="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-md bg-blue-50 dark:bg-blue-900/20 text-secondary-900 dark:text-white">
                    School ID: {user.schoolId}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">System Settings</CardTitle>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-secondary-300 mt-1">Configure system preferences and default options</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-secondary-200 mb-1">
                  Default Language
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-md bg-white dark:bg-black/30 text-secondary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-secondary-200 mb-1">
                  Time Zone
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-md bg-white dark:bg-black/30 text-secondary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option>UTC-5 (Eastern Time)</option>
                  <option>UTC-6 (Central Time)</option>
                  <option>UTC-7 (Mountain Time)</option>
                  <option>UTC-8 (Pacific Time)</option>
                </select>
              </div>
              <Button>Save Settings</Button>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Notification Preferences</CardTitle>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-secondary-300 mt-1">Manage how and when you receive notifications</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-secondary-200">Email Notifications</p>
                  <p className="text-xs text-gray-500 dark:text-secondary-400">Receive updates via email</p>
                </div>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-secondary-200">Performance Reports</p>
                  <p className="text-xs text-gray-500 dark:text-secondary-400">Weekly performance summaries</p>
                </div>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-secondary-200">New School Alerts</p>
                  <p className="text-xs text-gray-500 dark:text-secondary-400">Notifications for new school registrations</p>
                </div>
                <input type="checkbox" className="rounded" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Data Management</CardTitle>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-secondary-300 mt-1">Export data and manage system backups</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-secondary-200 mb-2">Export Data</h4>
                <div className="space-y-2">
                  <Button variant="outline" size="sm">Export Student Data</Button>
                  <Button variant="outline" size="sm">Export School Reports</Button>
                  <Button variant="outline" size="sm">Export Analytics</Button>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-secondary-200 mb-2">Backup</h4>
                <Button variant="outline" size="sm">Create Backup</Button>
                <p className="text-xs text-gray-500 dark:text-secondary-400 mt-1">Last backup: March 15, 2024</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
