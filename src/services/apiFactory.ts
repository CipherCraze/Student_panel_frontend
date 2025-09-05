import * as realApi from './api'
import * as mockApi from './mockApi'

// Determine which API to use based on environment
const isVercelDeployment = typeof window !== 'undefined' && (
  window.location.hostname.includes('vercel.app') || 
  window.location.hostname.includes('vercel.com') ||
  window.location.hostname.includes('student-panel-frontend') // Your specific deployment
)
const isProduction = import.meta.env.PROD || (typeof window !== 'undefined' && window.location.hostname !== 'localhost')

// Check if we have Vercel API routes available
const hasVercelAPI = typeof window !== 'undefined' && isVercelDeployment

// Use Vercel API if available, otherwise use mock API for production deployments
const useMockApi = !hasVercelAPI && (
  isVercelDeployment || 
  import.meta.env.VITE_MOCK_API === 'true' || 
  (isProduction && import.meta.env.VITE_MOCK_API !== 'false') ||
  (!import.meta.env.VITE_API_URL && isProduction)
)

// Debug logging
if (typeof window !== 'undefined') {
  if (import.meta.env.DEV) {
    console.log('🔧 API Factory Debug:', {
      hostname: window.location.hostname,
      isVercelDeployment,
      isProduction,
      hasVercelAPI,
      VITE_MOCK_API: import.meta.env.VITE_MOCK_API,
      VITE_API_URL: import.meta.env.VITE_API_URL,
      useMockApi
    })
  } else if (isProduction) {
    console.log('🚀 Production API Mode:', useMockApi ? 'Mock API' : hasVercelAPI ? 'Vercel API' : 'Real API')
  }
}

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
