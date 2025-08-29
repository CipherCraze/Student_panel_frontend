import * as realApi from './api'
import * as mockApi from './mockApi'

// Determine which API to use based on environment
// IMPORTANT: Only VITE_MOCK_API controls mock usage so we can use real backend in dev
const useMockApi = import.meta.env.VITE_MOCK_API === 'true' || !import.meta.env.VITE_API_URL

// API Factory - returns either real or mock API based on configuration
export const apiFactory = {
  auth: useMockApi ? mockApi.mockAuthApi : realApi.authApi,
  schools: useMockApi ? mockApi.mockSchoolsApi : realApi.schoolsApi,
  students: useMockApi ? mockApi.mockStudentsApi : realApi.studentsApi,
  analytics: useMockApi ? mockApi.mockAnalyticsApi : realApi.analyticsApi,
  leaderboard: useMockApi ? mockApi.mockLeaderboardApi : realApi.leaderboardApi,
  settings: useMockApi ? mockApi.mockSettingsApi : realApi.settingsApi,
  export: useMockApi ? mockApi.mockExportApi : realApi.exportApi,
  health: useMockApi ? mockApi.mockHealthApi : realApi.healthApi,
}

// Export the factory as default
export default apiFactory

// Also export individual APIs for direct access
export const {
  auth: authApi,
  schools: schoolsApi,
  students: studentsApi,
  analytics: analyticsApi,
  leaderboard: leaderboardApi,
  settings: settingsApi,
  export: exportApi,
  health: healthApi,
} = apiFactory

// Export the ApiError class
export { ApiError } from './api'

// Utility function to check if we're using mock API
export const isUsingMockApi = () => useMockApi

// Utility function to get API base URL
export const getApiBaseUrl = () => import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
