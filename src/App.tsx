import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { ThemeProvider } from './contexts/ThemeContext'
import { LoginPage } from './components/auth/LoginPage'
import RegisterPage from './components/auth/RegisterPage'
import OnboardingPage from './components/auth/OnboardingPage'
import { Layout } from './components/layout/Layout'
import { SchoolsPage } from './components/schools/SchoolsPage'
import { StudentsPage } from './components/students/StudentsPage'
import StudentManagementPage from './components/students/StudentManagementPage'
import { AnalyticsPage } from './components/analytics/AnalyticsPage'
import { SettingsPage } from './components/settings/SettingsPage'
import { LeaderboardPage } from './components/leaderboard/LeaderboardPage'
import { RoleBasedDashboard } from './components/dashboard/RoleBasedDashboard'
import { DataExplorerPage } from './components/superadmin/DataExplorerPage'
import { CollectionsPage } from './components/superadmin/CollectionsPage'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<RoleBasedDashboard />} />
                      <Route path="/dashboard" element={<RoleBasedDashboard />} />
                      <Route path="/schools" element={<SchoolsPage />} />
                      <Route path="/students" element={<StudentsPage />} />
                      <Route path="/student-management" element={<StudentManagementPage />} />
                      <Route path="/leaderboard" element={<LeaderboardPage />} />
                      <Route path="/analytics" element={<AnalyticsPage />} />
                      <Route path="/admin/data-explorer" element={<DataExplorerPage />} />
                      <Route path="/admin/collections" element={<CollectionsPage />} />
                      <Route path="/settings" element={<SettingsPage />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
