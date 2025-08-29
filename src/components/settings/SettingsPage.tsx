import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

export function SettingsPage() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Profile Settings</CardTitle>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-secondary-300 mt-1">Update your personal information and contact details</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input label="Full Name" defaultValue="Admin User" />
              <Input label="Email" type="email" defaultValue="admin@example.com" />
              <Input label="Phone" defaultValue="+1-555-0123" />
              <Button>Update Profile</Button>
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
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Manage how and when you receive notifications</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Email Notifications</p>
                  <p className="text-xs text-gray-500">Receive updates via email</p>
                </div>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Performance Reports</p>
                  <p className="text-xs text-gray-500">Weekly performance summaries</p>
                </div>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">New School Alerts</p>
                  <p className="text-xs text-gray-500">Notifications for new school registrations</p>
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
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Export data and manage system backups</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Export Data</h4>
                <div className="space-y-2">
                  <Button variant="outline" size="sm">Export Student Data</Button>
                  <Button variant="outline" size="sm">Export School Reports</Button>
                  <Button variant="outline" size="sm">Export Analytics</Button>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Backup</h4>
                <Button variant="outline" size="sm">Create Backup</Button>
                <p className="text-xs text-gray-500 mt-1">Last backup: March 15, 2024</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
