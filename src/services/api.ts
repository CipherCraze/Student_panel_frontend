import type { School, Student, User, DashboardStats } from '../types'

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Custom error class for API errors
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Request helper with authentication
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('token')
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new ApiError(
        errorData.message || `HTTP error! status: ${response.status}`,
        response.status,
        errorData.code
      )
    }

    return await response.json()
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Network error',
      0
    )
  }
}

// Authentication API
export const authApi = {
  login: async (email: string, password: string): Promise<{ token: string; user: User }> => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  },

  register: async (userData: { name: string; email: string; password: string; role: string }): Promise<{ token: string; user: User }> => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  },

  completeOnboarding: async (onboardingData: any): Promise<{ user: User }> => {
    return apiRequest('/auth/onboarding', {
      method: 'POST',
      body: JSON.stringify(onboardingData),
    })
  },

  logout: async (): Promise<void> => {
    return apiRequest('/auth/logout', {
      method: 'POST',
    })
  },

  refreshToken: async (): Promise<{ token: string }> => {
    return apiRequest('/auth/refresh', {
      method: 'POST',
    })
  },

  getCurrentUser: async (): Promise<User> => {
    return apiRequest('/auth/me')
  },
}

// Schools API
export const schoolsApi = {
  getAll: async (): Promise<School[]> => {
    return apiRequest('/schools')
  },

  getById: async (id: string): Promise<School> => {
    return apiRequest(`/schools/${id}`)
  },

  create: async (schoolData: Omit<School, 'id' | 'createdAt'>): Promise<School> => {
    return apiRequest('/schools', {
      method: 'POST',
      body: JSON.stringify(schoolData),
    })
  },

  update: async (id: string, schoolData: Partial<School>): Promise<School> => {
    return apiRequest(`/schools/${id}`, {
      method: 'PUT',
      body: JSON.stringify(schoolData),
    })
  },

  delete: async (id: string): Promise<void> => {
    return apiRequest(`/schools/${id}`, {
      method: 'DELETE',
    })
  },

  getStats: async (): Promise<{ totalSchools: number; activeSchools: number }> => {
    return apiRequest('/schools/stats')
  },
}

// Students API
export const studentsApi = {
  getAll: async (schoolId?: string): Promise<Student[]> => {
    const params = schoolId ? `?schoolId=${schoolId}` : ''
    const resp = await apiRequest<any>(`/students${params}`)
    if (Array.isArray(resp)) return resp as Student[]
    if (resp && Array.isArray(resp.students)) return resp.students as Student[]
    return []
  },

  getById: async (id: string): Promise<Student> => {
    return apiRequest(`/students/${id}`)
  },

  create: async (studentData: Omit<Student, 'id' | 'enrollmentDate'>): Promise<Student> => {
    return apiRequest('/students', {
      method: 'POST',
      body: JSON.stringify(studentData),
    })
  },

  update: async (id: string, studentData: Partial<Student>): Promise<Student> => {
    return apiRequest(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(studentData),
    })
  },

  delete: async (id: string): Promise<void> => {
    return apiRequest(`/students/${id}`, {
      method: 'DELETE',
    })
  },

  getPerformance: async (id: string): Promise<Student['performance']> => {
    return apiRequest(`/students/${id}/performance`)
  },

  getStats: async (schoolId?: string): Promise<{
    totalStudents: number
    averageAccuracy: number
    totalLessons: number
  }> => {
    const params = schoolId ? `?schoolId=${schoolId}` : ''
    const resp = await apiRequest<any>(`/students/stats/overview${params}`)
    const ov = resp?.overview || resp || { totalStudents: 0, averageAccuracy: 0, totalLessons: 0 }
    return {
      totalStudents: ov.totalStudents || 0,
      averageAccuracy: ov.averageAccuracy || 0,
      totalLessons: ov.totalLessons || 0,
    }
  },
}

// Analytics API
export const analyticsApi = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    return apiRequest('/analytics/dashboard')
  },

  getPerformanceDistribution: async (params?: Record<string,string>): Promise<any> => {
    const qs = params ? `?${new URLSearchParams(params)}` : ''
    return apiRequest(`/analytics/performance/distribution${qs}`)
  },

  getSkillAnalytics: async (params?: Record<string,string>): Promise<any> => {
    const qs = params ? `?${new URLSearchParams(params)}` : ''
    return apiRequest(`/analytics/performance/skills${qs}`)
  },

  getEngagementTrends: async (params?: Record<string,string>): Promise<any> => {
    const qs = params ? `?${new URLSearchParams(params)}` : ''
    return apiRequest(`/analytics/engagement/trends${qs}`)
  },

  getTopPerformingSchools: async (limit: number = 10): Promise<any[]> => {
    return apiRequest(`/analytics/schools/top-performing?limit=${limit}`)
  },
}

// Leaderboard API
export const leaderboardApi = {
  getTopStudents: async (limit: number = 10, opts?: { schoolId?: string; className?: string; sortBy?: string; period?: string }): Promise<any[]> => {
    const params = new URLSearchParams({ limit: String(limit), ...(opts?.schoolId ? { schoolId: opts.schoolId } : {}), ...(opts?.className ? { class: opts.className } : {}), ...(opts?.sortBy ? { sortBy: opts.sortBy } : {}), ...(opts?.period ? { period: opts.period } : {}) })
    return apiRequest(`/leaderboard/students/top?${params.toString()}`)
  },

  getStudentRank: async (studentId: string, opts?: { schoolId?: string; className?: string; sortBy?: string }): Promise<{ rank: number; totalStudents: number; percentile: number }> => {
    const params = new URLSearchParams({ ...(opts?.schoolId ? { schoolId: opts.schoolId } : {}), ...(opts?.className ? { class: opts.className } : {}), ...(opts?.sortBy ? { sortBy: opts.sortBy } : {}) })
    return apiRequest(`/leaderboard/students/${studentId}/rank?${params.toString()}`)
  },

  getClassLeaderboard: async (className: string, opts?: { schoolId?: string; sortBy?: string; limit?: number }): Promise<any[]> => {
    const params = new URLSearchParams({ ...(opts?.schoolId ? { schoolId: opts.schoolId } : {}), ...(opts?.sortBy ? { sortBy: opts.sortBy } : {}), ...(opts?.limit ? { limit: String(opts.limit) } : {}) })
    return apiRequest(`/leaderboard/classes/${encodeURIComponent(className)}?${params.toString()}`)
  },
}

// Settings API
export const settingsApi = {
  getUserSettings: async (): Promise<any> => {
    return apiRequest('/settings/user')
  },

  updateUserSettings: async (settings: any): Promise<any> => {
    return apiRequest('/settings/user', {
      method: 'PUT',
      body: JSON.stringify(settings),
    })
  },

  getSystemSettings: async (): Promise<any> => {
    return apiRequest('/settings/system')
  },

  updateSystemSettings: async (settings: any): Promise<any> => {
    return apiRequest('/settings/system', {
      method: 'PUT',
      body: JSON.stringify(settings),
    })
  },
}

// Export API
export const exportApi = {
  exportStudents: async (filters?: any): Promise<Blob> => {
    const params = filters ? `?${new URLSearchParams(filters)}` : ''
    const response = await fetch(`${API_BASE_URL}/export/students${params}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
    
    if (!response.ok) {
      throw new ApiError('Export failed', response.status)
    }
    
    return response.blob()
  },

  exportSchools: async (): Promise<Blob> => {
    const response = await fetch(`${API_BASE_URL}/export/schools`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
    
    if (!response.ok) {
      throw new ApiError('Export failed', response.status)
    }
    
    return response.blob()
  },

  exportAnalytics: async (dateRange?: { start: string; end: string }): Promise<Blob> => {
    const params = dateRange ? `?${new URLSearchParams(dateRange)}` : ''
    const response = await fetch(`${API_BASE_URL}/export/analytics${params}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
    
    if (!response.ok) {
      throw new ApiError('Export failed', response.status)
    }
    
    return response.blob()
  },
}

// Health check
export const healthApi = {
  check: async (): Promise<{ status: string; timestamp: string }> => {
    return apiRequest('/health')
  },
}

// Default export for convenience
export default {
  auth: authApi,
  schools: schoolsApi,
  students: studentsApi,
  analytics: analyticsApi,
  leaderboard: leaderboardApi,
  settings: settingsApi,
  export: exportApi,
  health: healthApi,
}
