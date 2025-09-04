import type { School, Student, User, DashboardStats } from '../types'

// Mock data
let mockUsers: User[] = [
  {
    id: '1',
    email: 'super@admin.com',
    name: 'Super Admin',
    role: 'super_admin',
    password: 'password', // Default password for demo users
  },
  {
    id: '2',
    email: 'school@admin.com',
    name: 'School Admin',
    role: 'school_admin',
    schoolId: '1',
    password: 'password', // Default password for demo users
  },
]

let mockSchools: School[] = [
  {
    id: '1',
    name: 'Greenwood Elementary',
    board: 'CBSE',
    adminContact: {
      name: 'Sarah Johnson',
      email: 'sarah@greenwood.edu',
      phone: '+1-555-0123',
    },
    totalStudents: 245,
    createdAt: '2024-01-15',
    status: 'active',
  },
  {
    id: '2',
    name: 'Riverside High School',
    board: 'ICSE',
    adminContact: {
      name: 'Michael Chen',
      email: 'michael@riverside.edu',
      phone: '+1-555-0124',
    },
    totalStudents: 456,
    createdAt: '2024-02-20',
    status: 'active',
  },
  {
    id: '3',
    name: 'Sunnydale Academy',
    board: 'State Board',
    adminContact: {
      name: 'Emily Davis',
      email: 'emily@sunnydale.edu',
      phone: '+1-555-0125',
    },
    totalStudents: 189,
    createdAt: '2024-03-10',
    status: 'inactive',
  },
]



const mockStudents: Student[] = [
  {
    id: '1',
    name: 'Ahan Kumar',
    class: 'Class 8',
    schoolId: '1',
    enrollmentDate: '2024-01-15',
    performance: {
      accuracyPercentage: 96,
      lessonsCompleted: 68,
      timeSpentMinutes: 8700,
      xpPoints: 830,
      skillAreas: {
        vocabulary: 98,
        grammar: 96,
        pronunciation: 94,
        listening: 97,
        speaking: 95,
      },
    },
  },
  {
    id: '2',
    name: 'Hvff',
    class: 'Class 7',
    schoolId: '1',
    enrollmentDate: '2024-01-20',
    performance: {
      accuracyPercentage: 94,
      lessonsCompleted: 45,
      timeSpentMinutes: 5880,
      xpPoints: 295,
      skillAreas: {
        vocabulary: 96,
        grammar: 94,
        pronunciation: 92,
        listening: 95,
        speaking: 93,
      },
    },
  },
  // Add more mock students as needed
]

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Initialize localStorage with mock data if not already present
const initializeMockData = () => {
  if (!localStorage.getItem('mockUsers')) {
    localStorage.setItem('mockUsers', JSON.stringify(mockUsers))
  }
  if (!localStorage.getItem('mockSchools')) {
    localStorage.setItem('mockSchools', JSON.stringify(mockSchools))
  }
}

// Initialize on module load
initializeMockData()

// Mock API functions
export const mockAuthApi = {
  login: async (email: string, password: string): Promise<{ token: string; user: User }> => {
    await delay(1000)
    
    // First check in mockUsers array
    let user = mockUsers.find(u => u.email === email)
    
    // If not found, check localStorage for newly registered users
    if (!user) {
      try {
        const storedUsers = localStorage.getItem('mockUsers')
        if (storedUsers) {
          const users = JSON.parse(storedUsers)
          user = users.find((u: User) => u.email === email)
        }
      } catch (error) {
        console.warn('Error reading from localStorage:', error)
      }
    }
    
    if (!user || user.password !== password) {
      throw new Error('Invalid credentials')
    }
    
    return {
      token: `mock-token-${user.id}`,
      user,
    }
  },

  register: async (userData: { name: string; email: string; password: string; role: string }): Promise<{ token: string; user: User }> => {
    await delay(1000)
    
    // Check if email already exists
    if (mockUsers.find(u => u.email === userData.email)) {
      throw new Error('Email already registered')
    }
    
    const newUser: User = {
      id: Date.now().toString(),
      name: userData.name,
      email: userData.email,
      role: userData.role as 'school_admin',
      onboardingCompleted: false,
      password: userData.password // Store the password for login
    }
    
    mockUsers.push(newUser)
    
    // Store users data in localStorage
    localStorage.setItem('mockUsers', JSON.stringify(mockUsers))
    
    // Store current user ID for onboarding
    localStorage.setItem('currentUserId', newUser.id)
    
    return {
      token: `mock-token-${newUser.id}`,
      user: newUser,
    }
  },

  completeOnboarding: async (onboardingData: any): Promise<{ user: User }> => {
    await delay(1500)
    
    // Create new school
    const newSchool: School = {
      id: Date.now().toString(),
      name: onboardingData.schoolName,
      board: onboardingData.board,
      adminContact: {
        name: onboardingData.adminName,
        email: onboardingData.adminEmail,
        phone: onboardingData.adminPhone,
      },
      address: onboardingData.schoolAddress,
      website: onboardingData.website,
      description: onboardingData.description,
      totalStudents: 0,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'active',
    }
    
    mockSchools.push(newSchool)
    
    // Store schools data in localStorage
    localStorage.setItem('mockSchools', JSON.stringify(mockSchools))
    
    // Update user with school ID and mark onboarding as complete
    const currentUser = mockUsers.find(u => u.id === localStorage.getItem('currentUserId'))
    if (currentUser) {
      currentUser.schoolId = newSchool.id
      currentUser.onboardingCompleted = true
    }
    
    // Store updated users data in localStorage
    localStorage.setItem('mockUsers', JSON.stringify(mockUsers))
    
    return {
      user: currentUser || mockUsers[mockUsers.length - 1]
    }
  },

  logout: async (): Promise<void> => {
    await delay(500)
  },

  refreshToken: async (): Promise<{ token: string }> => {
    await delay(500)
    return { token: 'mock-refreshed-token' }
  },

  getCurrentUser: async (): Promise<User> => {
    await delay(500)
    return mockUsers[0] // Return super admin by default
  },
}

export const mockSchoolsApi = {
  getAll: async (): Promise<School[]> => {
    await delay(800)
    return mockSchools
  },

  getById: async (id: string): Promise<School> => {
    await delay(500)
    const school = mockSchools.find(s => s.id === id)
    if (!school) throw new Error('School not found')
    return school
  },

  create: async (schoolData: Omit<School, 'id' | 'createdAt'>): Promise<School> => {
    await delay(1000)
    const newSchool: School = {
      ...schoolData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
    }
    mockSchools.push(newSchool)
    return newSchool
  },

  update: async (id: string, schoolData: Partial<School>): Promise<School> => {
    await delay(800)
    const index = mockSchools.findIndex(s => s.id === id)
    if (index === -1) throw new Error('School not found')
    
    mockSchools[index] = { ...mockSchools[index], ...schoolData }
    return mockSchools[index]
  },

  delete: async (id: string): Promise<void> => {
    await delay(500)
    const index = mockSchools.findIndex(s => s.id === id)
    if (index === -1) throw new Error('School not found')
    mockSchools.splice(index, 1)
  },

  getStats: async (): Promise<{ totalSchools: number; activeSchools: number }> => {
    await delay(500)
    return {
      totalSchools: mockSchools.length,
      activeSchools: mockSchools.filter(s => s.status === 'active').length,
    }
  },

  // Get detailed school information with analytics (mock)
  getSchoolDetails: async (schoolId: string): Promise<any> => {
    await delay(500)
    const school = mockSchools.find(s => s.id === schoolId)
    if (!school) throw new Error('School not found')
    return {
      ...school,
      analytics: {
        totalStudents: mockStudents.filter(s => s.schoolId === schoolId).length,
        totalClasses: 8,
        averagePerformance: 85.5,
        monthlyGrowth: 12
      }
    }
  },

  // Get school analytics (mock)
  getSchoolAnalytics: async (schoolId: string): Promise<any> => {
    await delay(500)
    const schoolStudents = mockStudents.filter(s => s.schoolId === schoolId)
    return {
      totalStudents: schoolStudents.length,
      totalClasses: 8,
      averagePerformance: schoolStudents.length > 0 
        ? Math.round(schoolStudents.reduce((sum, s) => sum + s.performance.accuracyPercentage, 0) / schoolStudents.length)
        : 0,
      monthlyGrowth: Math.random() * 20 + 5 // Random growth between 5-25%
    }
  },

  // Get school performance metrics (mock)
  getPerformanceMetrics: async (_schoolId: string): Promise<any> => {
    await delay(500)
    return {
      metrics: [
        { month: 'Jan', performance: 82 },
        { month: 'Feb', performance: 85 },
        { month: 'Mar', performance: 88 },
        { month: 'Apr', performance: 87 },
        { month: 'May', performance: 90 }
      ],
      trends: ['improving', 'vocabulary_strong', 'grammar_needs_work']
    }
  },
}

export const mockStudentsApi = {
  getAll: async (schoolId?: string): Promise<Student[]> => {
    await delay(800)
    if (schoolId) {
      return mockStudents.filter(s => s.schoolId === schoolId)
    }
    return mockStudents
  },

  getById: async (id: string): Promise<Student> => {
    await delay(500)
    const student = mockStudents.find(s => s.id === id)
    if (!student) throw new Error('Student not found')
    return student
  },

  create: async (studentData: Omit<Student, 'id' | 'enrollmentDate'>): Promise<Student> => {
    await delay(1000)
    const newStudent: Student = {
      ...studentData,
      id: Date.now().toString(),
      enrollmentDate: new Date().toISOString().split('T')[0],
      performance: {
        accuracyPercentage: 0,
        lessonsCompleted: 0,
        timeSpentMinutes: 0,
        xpPoints: 0,
        skillAreas: {
          vocabulary: 0,
          grammar: 0,
          pronunciation: 0,
          listening: 0,
          speaking: 0,
        },
      },
    }
    mockStudents.push(newStudent)
    return newStudent
  },

  update: async (id: string, studentData: Partial<Student>): Promise<Student> => {
    await delay(800)
    const index = mockStudents.findIndex(s => s.id === id)
    if (index === -1) throw new Error('Student not found')
    
    mockStudents[index] = { ...mockStudents[index], ...studentData }
    return mockStudents[index]
  },

  delete: async (id: string): Promise<void> => {
    await delay(500)
    const index = mockStudents.findIndex(s => s.id === id)
    if (index === -1) throw new Error('Student not found')
    mockStudents.splice(index, 1)
  },

  getPerformance: async (id: string): Promise<Student['performance']> => {
    await delay(500)
    const student = mockStudents.find(s => s.id === id)
    if (!student) throw new Error('Student not found')
    return student.performance
  },

  getStats: async (schoolId?: string): Promise<{
    totalStudents: number
    averageAccuracy: number
    totalLessons: number
  }> => {
    await delay(500)
    const students = schoolId ? mockStudents.filter(s => s.schoolId === schoolId) : mockStudents
    
    return {
      totalStudents: students.length,
      averageAccuracy: students.length > 0 
        ? Math.round(students.reduce((sum, s) => sum + s.performance.accuracyPercentage, 0) / students.length)
        : 0,
      totalLessons: students.reduce((sum, s) => sum + s.performance.lessonsCompleted, 0),
    }
  },

  // Get students by school (mock)
  getBySchool: async (schoolId: string): Promise<Student[]> => {
    await delay(500)
    return mockStudents.filter(s => s.schoolId === schoolId)
  },

  // Get top performing students (mock)
  getTopPerformers: async (schoolId?: string, limit: number = 10): Promise<Student[]> => {
    await delay(500)
    let students = schoolId ? mockStudents.filter(s => s.schoolId === schoolId) : mockStudents
    return students
      .sort((a, b) => b.performance.accuracyPercentage - a.performance.accuracyPercentage)
      .slice(0, limit)
  },

  // Get class-wise statistics (mock)
  getClasswiseStats: async (schoolId?: string): Promise<any[]> => {
    await delay(500)
    const students = schoolId ? mockStudents.filter(s => s.schoolId === schoolId) : mockStudents
    const classwiseData: { [key: string]: any } = {}
    
    students.forEach(student => {
      if (!classwiseData[student.class]) {
        classwiseData[student.class] = {
          class: student.class,
          students: 0,
          totalAccuracy: 0
        }
      }
      classwiseData[student.class].students++
      classwiseData[student.class].totalAccuracy += student.performance.accuracyPercentage
    })

    return Object.values(classwiseData).map((cls: any) => ({
      ...cls,
      accuracy: cls.students > 0 ? Math.round(cls.totalAccuracy / cls.students) : 0
    }))
  },

  // Get performance distribution (mock)
  getPerformanceDistribution: async (schoolId?: string): Promise<any> => {
    await delay(500)
    const students = schoolId ? mockStudents.filter(s => s.schoolId === schoolId) : mockStudents
    const distribution = {
      excellent: students.filter(s => s.performance.accuracyPercentage >= 90).length,
      good: students.filter(s => s.performance.accuracyPercentage >= 80 && s.performance.accuracyPercentage < 90).length,
      average: students.filter(s => s.performance.accuracyPercentage >= 70 && s.performance.accuracyPercentage < 80).length,
      needsImprovement: students.filter(s => s.performance.accuracyPercentage < 70).length
    }
    
    return {
      distribution: [
        { name: 'Excellent (90-100%)', value: distribution.excellent, color: '#10b981' },
        { name: 'Good (80-89%)', value: distribution.good, color: '#3b82f6' },
        { name: 'Average (70-79%)', value: distribution.average, color: '#f59e0b' },
        { name: 'Needs Improvement', value: distribution.needsImprovement, color: '#ef4444' }
      ],
      averages: {
        vocabulary: 85,
        grammar: 87,
        pronunciation: 82,
        listening: 89,
        speaking: 84
      }
    }
  },

  // Get recent activities (mock)
  getRecentActivities: async (schoolId?: string, limit: number = 20): Promise<any[]> => {
    await delay(500)
    const students = schoolId ? mockStudents.filter(s => s.schoolId === schoolId) : mockStudents
    const activities = students.slice(0, limit).map((student, index) => ({
      id: `activity-${index}`,
      studentId: student.id,
      studentName: student.name,
      activity: ['Completed lesson', 'Achieved milestone', 'Improved accuracy', 'Started new module'][Math.floor(Math.random() * 4)],
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      details: `${student.performance.accuracyPercentage}% accuracy`
    }))
    
    return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  },
}

export const mockAnalyticsApi = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    await delay(800)
    return {
      totalSchools: mockSchools.length,
      totalStudents: mockStudents.length,
      activeSchools: mockSchools.filter(s => s.status === 'active').length,
      averageAccuracy: 85.2,
    }
  },

  getPerformanceDistribution: async (): Promise<{
    excellent: number
    good: number
    needsImprovement: number
  }> => {
    await delay(500)
    return {
      excellent: 35,
      good: 45,
      needsImprovement: 20,
    }
  },

  getSkillAnalytics: async (): Promise<{
    skill: string
    average: number
    improvement: number
  }[]> => {
    await delay(500)
    return [
      { skill: 'Vocabulary', average: 82, improvement: 5 },
      { skill: 'Grammar', average: 78, improvement: 8 },
      { skill: 'Pronunciation', average: 76, improvement: 12 },
      { skill: 'Listening', average: 85, improvement: 3 },
      { skill: 'Speaking', average: 74, improvement: 15 },
    ]
  },

  getEngagementTrends: async (): Promise<{
    month: string
    avgTime: number
    lessons: number
  }[]> => {
    await delay(500)
    return [
      { month: 'Jan', avgTime: 45, lessons: 12 },
      { month: 'Feb', avgTime: 52, lessons: 15 },
      { month: 'Mar', avgTime: 48, lessons: 18 },
      { month: 'Apr', avgTime: 55, lessons: 20 },
      { month: 'May', avgTime: 58, lessons: 22 },
    ]
  },

  getTopPerformingSchools: async (): Promise<any[]> => {
    await delay(800)
    return [
      {
        id: '1',
        name: 'Bright Future International',
        board: 'IB',
        accuracy: 94.2,
        students: 312,
        activeStudents: 298,
        improvement: '+8%',
        region: 'Pune',
        totalLessons: 2847,
        avgSessionTime: '28 min',
        adminContact: 'david@brightfuture.edu',
        rank: 1,
        badges: ['🏆', '⭐', '🔥'],
      },
      // Add more mock data as needed
    ]
  },
}

export const mockLeaderboardApi = {
  getTopStudents: async (limit: number = 10): Promise<any[]> => {
    await delay(800)
    return mockStudents
      .sort((a, b) => b.performance.xpPoints - a.performance.xpPoints)
      .slice(0, limit)
      .map((student, index) => ({
        ...student,
        rank: index + 1,
        badges: ['🏆', '🔥', '⚡'].slice(0, Math.floor(Math.random() * 3) + 1),
      }))
  },

  getStudentRank: async (studentId: string): Promise<{ rank: number; totalStudents: number }> => {
    await delay(500)
    const sortedStudents = mockStudents.sort((a, b) => b.performance.xpPoints - a.performance.xpPoints)
    const rank = sortedStudents.findIndex(s => s.id === studentId) + 1
    return { rank, totalStudents: mockStudents.length }
  },

  getClassLeaderboard: async (classId: string): Promise<any[]> => {
    await delay(800)
    return mockStudents
      .filter(s => s.class === classId)
      .sort((a, b) => b.performance.xpPoints - a.performance.xpPoints)
      .map((student, index) => ({
        ...student,
        rank: index + 1,
      }))
  },
}

export const mockSettingsApi = {
  getUserSettings: async (): Promise<any> => {
    await delay(500)
    return {
      notifications: { email: true, performance: true, newSchools: false },
      language: 'English',
      timezone: 'UTC-5',
    }
  },

  updateUserSettings: async (settings: any): Promise<any> => {
    await delay(800)
    return settings
  },

  getSystemSettings: async (): Promise<any> => {
    await delay(500)
    return {
      maintenance: false,
      version: '1.0.0',
      features: {
        analytics: true,
        export: true,
        realTime: true,
      },
    }
  },

  updateSystemSettings: async (settings: any): Promise<any> => {
    await delay(800)
    return settings
  },
}

export const mockExportApi = {
  exportStudents: async (_filters?: any): Promise<Blob> => {
    await delay(2000)
    const csvContent = 'Name,Class,Accuracy,Lessons,XP\n' +
      mockStudents.map(s => 
        `${s.name},${s.class},${s.performance.accuracyPercentage},${s.performance.lessonsCompleted},${s.performance.xpPoints}`
      ).join('\n')
    return new Blob([csvContent], { type: 'text/csv' })
  },

  exportSchools: async (): Promise<Blob> => {
    await delay(1500)
    const csvContent = 'Name,Board,Students,Status\n' +
      mockSchools.map(s => 
        `${s.name},${s.board},${s.totalStudents},${s.status}`
      ).join('\n')
    return new Blob([csvContent], { type: 'text/csv' })
  },

  exportAnalytics: async (_dateRange?: { start: string; end: string }): Promise<Blob> => {
    await delay(2000)
    const csvContent = 'Metric,Value\n' +
      'Total Schools,' + mockSchools.length + '\n' +
      'Total Students,' + mockStudents.length + '\n' +
      'Average Accuracy,85.2\n'
    return new Blob([csvContent], { type: 'text/csv' })
  },
}

export const mockHealthApi = {
  check: async (): Promise<{ status: string; timestamp: string }> => {
    await delay(200)
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    }
  },
}

// Default export
export default {
  auth: mockAuthApi,
  schools: mockSchoolsApi,
  students: mockStudentsApi,
  analytics: mockAnalyticsApi,
  leaderboard: mockLeaderboardApi,
  settings: mockSettingsApi,
  export: mockExportApi,
  health: mockHealthApi,
}
