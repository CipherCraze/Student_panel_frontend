import { useEffect, useMemo, useState } from 'react'
// Learning levels for random assignment
const learningLevels = [
  { name: 'Expert', icon: '👑', color: 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white' },
  { name: 'Advanced', icon: '🌟', color: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' },
  { name: 'Intermediate', icon: '📚', color: 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white' },
  { name: 'Beginner', icon: '🌱', color: 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white' },
  { name: 'Foundation', icon: '🎯', color: 'bg-gradient-to-r from-gray-500 to-slate-600 text-white' }
]
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { 
  UserGroupIcon, 
  AcademicCapIcon, 
  TrophyIcon, 
  ChartBarIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useAuth } from '../../contexts/AuthContext'
import { schoolsApi, studentsApi, isUsingMockApi } from '../../services/apiFactory'
import type { School } from '../../types'

// Mock data for school admin (fallback for when backend is disabled)
const mockSchoolData = {
  schoolInfo: {
    id: 'school-1',
    name: 'Greenwood Elementary School',
    board: 'CBSE',
    totalStudents: 245,
    totalClasses: 8
  },
  classwiseEnrollment: [
    { class: 'Class 1', students: 35, accuracy: 82 },
    { class: 'Class 2', students: 32, accuracy: 85 },
    { class: 'Class 3', students: 28, accuracy: 88 },
    { class: 'Class 4', students: 30, accuracy: 84 },
    { class: 'Class 5', students: 25, accuracy: 86 },
    { class: 'Class 6', students: 28, accuracy: 89 },
    { class: 'Class 7', students: 33, accuracy: 87 },
    { class: 'Class 8', students: 34, accuracy: 83 }
  ],
  topStudents: [
    {
      id: '1',
      name: 'Ahan Kumar',
      class: 'Class 8',
      accuracy: 96,
      xpPoints: 830,
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      rank: 1,
      lessonsCompleted: 68,
      timeSpent: '145 hrs',
      badge: '🏆',
      streak: 15
    },
    {
      id: '2',
      name: 'Hvff',
      class: 'Class 7',
      accuracy: 94,
      xpPoints: 295,
      photo: 'https://images.unsplash.com/photo-1494790108755-2616b612b1e7?w=150&h=150&fit=crop&crop=face',
      rank: 2,
      lessonsCompleted: 45,
      timeSpent: '98 hrs',
      badge: '🥈',
      streak: 12
    },
    {
      id: '3',
      name: 'Flower Girl',
      class: 'Class 6',
      accuracy: 93,
      xpPoints: 190,
      photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      rank: 3,
      lessonsCompleted: 38,
      timeSpent: '85 hrs',
      badge: '🥉',
      streak: 8
    },
    {
      id: '4',
      name: '12 June Child Test',
      class: 'Class 5',
      accuracy: 92,
      xpPoints: 165,
      photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      rank: 4,
      lessonsCompleted: 32,
      timeSpent: '78 hrs',
      badge: '⭐',
      streak: 6
    },
    {
      id: '5',
      name: 'Hcdff',
      class: 'Class 4',
      accuracy: 91,
      xpPoints: 160,
      photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
      rank: 5,
      lessonsCompleted: 30,
      timeSpent: '72 hrs',
      badge: '⭐',
      streak: 5
    },
    {
      id: '6',
      name: 'Eva',
      class: 'Class 3',
      accuracy: 90,
      xpPoints: 145,
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      rank: 6,
      lessonsCompleted: 28,
      timeSpent: '68 hrs',
      badge: '⭐',
      streak: 4
    },
    {
      id: '7',
      name: 'Sophia Kim',
      class: 'Class 2',
      accuracy: 89,
      xpPoints: 138,
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
      rank: 7,
      lessonsCompleted: 26,
      timeSpent: '65 hrs',
      badge: '🌟',
      streak: 7
    },
    {
      id: '8',
      name: 'James Wilson',
      class: 'Class 6',
      accuracy: 88,
      xpPoints: 132,
      photo: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=150&h=150&fit=crop&crop=face',
      rank: 8,
      lessonsCompleted: 24,
      timeSpent: '58 hrs',
      badge: '🌟',
      streak: 3
    },
    {
      id: '9',
      name: 'Olivia Davis',
      class: 'Class 5',
      accuracy: 87,
      xpPoints: 128,
      photo: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=150&h=150&fit=crop&crop=face',
      rank: 9,
      lessonsCompleted: 22,
      timeSpent: '55 hrs',
      badge: '🌟',
      streak: 9
    },
    {
      id: '10',
      name: 'Liam Garcia',
      class: 'Class 1',
      accuracy: 86,
      xpPoints: 120,
      photo: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&h=150&fit=crop&crop=face',
      rank: 10,
      lessonsCompleted: 20,
      timeSpent: '52 hrs',
      badge: '🌟',
      streak: 2
    }
  ],
  allStudents: [
    // This would include all 245 students - for demo showing a subset
    {
      id: '11',
      name: 'Ava Martinez',
      class: 'Class 3',
      accuracy: 85,
      xpPoints: 4100,
      photo: 'https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?w=150&h=150&fit=crop&crop=face',
      lessonsCompleted: 45,
      timeSpent: '108 hrs',
      enrollmentDate: '2024-01-15'
    },
    {
      id: '12',
      name: 'Noah Thompson',
      class: 'Class 4',
      accuracy: 83,
      xpPoints: 3950,
      photo: 'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=150&h=150&fit=crop&crop=face',
      lessonsCompleted: 42,
      timeSpent: '102 hrs',
      enrollmentDate: '2024-01-20'
    }
  ]
}

const performanceDistribution = [
  { name: 'Excellent (90-100%)', value: 35, color: '#10b981' },
  { name: 'Good (80-89%)', value: 45, color: '#3b82f6' },
  { name: 'Average (70-79%)', value: 15, color: '#f59e0b' },
  { name: 'Needs Improvement', value: 5, color: '#ef4444' }
]

export function SchoolAdminDashboard() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [selectedClass, setSelectedClass] = useState<string>('all')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [school, setSchool] = useState<School | null>(null)
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [allStudents, setAllStudents] = useState<any[]>([])
  const [topStudents, setTopStudents] = useState<any[]>([])
  const [classwiseData, setClasswiseData] = useState<any[]>([])

  // Comprehensive data loading for school admin
  useEffect(() => {
    let isMounted = true
    
    async function loadSchoolAdminData() {
      if (!user?.schoolId) {
        console.log('No schoolId found for user:', user)
        setError('School ID not found. Please contact administrator.')
        return
      }

      if (user.role !== 'school_admin') {
        console.log('User is not a school admin:', user)
        setError('Access denied. School admin role required.')
        return
      }

      setLoading(true)
      setError(null)

      try {
        console.log('Loading comprehensive school admin data for schoolId:', user.schoolId)
        
        // Use mock data if API is disabled
        if (isUsingMockApi()) {
          console.log('Using mock data for school admin dashboard')
          if (!isMounted) return
          setSchool({ 
            id: user.schoolId as string, 
            name: mockSchoolData.schoolInfo.name,
            board: mockSchoolData.schoolInfo.board,
            totalStudents: mockSchoolData.schoolInfo.totalStudents,
            totalClasses: mockSchoolData.schoolInfo.totalClasses,
            adminContact: { name: 'Admin', email: 'admin@school.com', phone: '123-456-7890' },
            createdAt: '2024-01-01',
            status: 'active'
          } as School)
          setAllStudents(mockSchoolData.topStudents)
          setTopStudents(mockSchoolData.topStudents.slice(0, 5))
          setClasswiseData(mockSchoolData.classwiseEnrollment)
          setDashboardData({
            totalStudents: mockSchoolData.schoolInfo.totalStudents,
            totalClasses: mockSchoolData.schoolInfo.totalClasses,
            averagePerformance: 85.5,
            monthlyGrowth: 12
          })
          setLoading(false)
          return
        }

        // Fetch all data in parallel for better performance
        const [
          schoolDetails,
          schoolAnalytics,
          schoolStudents,
          topPerformers,
          classwiseStats,
          recentActivities
        ] = await Promise.allSettled([
          schoolsApi.getById(user.schoolId as string),
          schoolsApi.getSchoolAnalytics(user.schoolId as string),
          studentsApi.getBySchool(user.schoolId as string),
          studentsApi.getTopPerformers(user.schoolId as string, 10),
          studentsApi.getClasswiseStats(user.schoolId as string),
          studentsApi.getRecentActivities(user.schoolId as string, 20)
        ])

        if (!isMounted) return

        // Process school details
        if (schoolDetails.status === 'fulfilled') {
          console.log('School details loaded:', schoolDetails.value)
          setSchool(schoolDetails.value)
        } else {
          console.error('Failed to load school details:', schoolDetails.reason)
        }

        // Process analytics
        if (schoolAnalytics.status === 'fulfilled') {
          console.log('School analytics loaded:', schoolAnalytics.value)
          setDashboardData(schoolAnalytics.value)
        } else {
          console.warn('School analytics failed, using defaults:', schoolAnalytics.reason)
          setDashboardData({
            totalStudents: 0,
            totalClasses: 0,
            averagePerformance: 0,
            monthlyGrowth: 0
          })
        }

        // Process students
        if (schoolStudents.status === 'fulfilled') {
          console.log('Students loaded:', schoolStudents.value.length)
          setAllStudents(schoolStudents.value)
        } else {
          console.warn('Students loading failed:', schoolStudents.reason)
          setAllStudents([])
        }

        // Process top performers
        if (topPerformers.status === 'fulfilled') {
          console.log('Top performers loaded:', topPerformers.value.length)
          setTopStudents(topPerformers.value)
        } else {
          console.warn('Top performers loading failed:', topPerformers.reason)
          setTopStudents([])
        }

        // Process classwise stats
        if (classwiseStats.status === 'fulfilled') {
          console.log('Classwise stats loaded:', classwiseStats.value.length)
          setClasswiseData(classwiseStats.value)
        } else {
          console.warn('Classwise stats loading failed:', classwiseStats.reason)
          setClasswiseData([])
        }

        // Process recent activities
        if (recentActivities.status === 'fulfilled') {
          console.log('Recent activities loaded:', recentActivities.value.length)
          // Activities data loaded but not currently used in UI
        } else {
          console.warn('Recent activities loading failed:', recentActivities.reason)
          // Activities loading failed but not critical
        }

      } catch (e: any) {
        if (!isMounted) return
        console.error('Critical error loading school admin data:', e)
        setError(`Failed to load dashboard data: ${e?.message || 'Unknown error'}`)
        
        // Fallback to mock data on critical error
        console.log('Using mock data as fallback due to critical error')
        setSchool({ 
          id: user.schoolId as string, 
          name: mockSchoolData.schoolInfo.name,
          board: mockSchoolData.schoolInfo.board,
          totalStudents: mockSchoolData.schoolInfo.totalStudents,
          totalClasses: mockSchoolData.schoolInfo.totalClasses,
          adminContact: { name: 'Admin', email: 'admin@school.com', phone: '123-456-7890' },
          createdAt: '2024-01-01',
          status: 'active'
        } as School)
        setAllStudents(mockSchoolData.topStudents)
        setTopStudents(mockSchoolData.topStudents.slice(0, 5))
        setClasswiseData(mockSchoolData.classwiseEnrollment)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadSchoolAdminData()
    
    return () => {
      isMounted = false
    }
  }, [user?.schoolId, user?.role])

  const finalSchoolData = useMemo(() => {
    if (!isUsingMockApi() && school && dashboardData) {
      return {
        schoolInfo: {
          id: (school.id as any) || (school as any)._id || '',
          name: school.name,
          board: school.board || 'Other',
          totalStudents: dashboardData.totalStudents || 0,
          totalClasses: dashboardData.totalClasses || 8,
        },
        // Use the loaded data instead of mock data
        classwiseEnrollment: classwiseData.length > 0 ? classwiseData : mockSchoolData.classwiseEnrollment,
        topStudents: topStudents.length > 0 ? topStudents : mockSchoolData.topStudents,
        allStudents: allStudents.length > 0 ? allStudents : mockSchoolData.allStudents,
      }
    } else if (!isUsingMockApi() && error) {
      // Backend failed, show error message with partial data
      return {
        schoolInfo: {
          id: user?.schoolId || 'unknown',
          name: 'Error Loading School Data',
          board: 'N/A',
          totalStudents: 0,
          totalClasses: 0,
        },
        classwiseEnrollment: [],
        topStudents: [],
        allStudents: [],
      }
    }
    return mockSchoolData
  }, [school, dashboardData, classwiseData, topStudents, allStudents, error, user?.schoolId])

  const getPerformanceColor = (accuracy: number) => {
    if (accuracy >= 90) return 'text-green-600 bg-green-100'
    if (accuracy >= 80) return 'text-blue-600 bg-blue-100'
    if (accuracy >= 70) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {loading && (
        <div className="text-center text-secondary-600">Loading your school...</div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Unable to load school data
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
                <p className="mt-1">Please check your internet connection or contact support if the issue persists.</p>
                <p className="mt-1 text-xs">School ID: {user?.schoolId}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold gradient-text">
            {finalSchoolData.schoolInfo.name}
          </h1>
          <p className="mt-1 sm:mt-2 text-secondary-600 text-sm sm:text-base">
            Welcome back, {user?.name}! Here's your school's overview.
          </p>
        </div>
        <div className="flex-shrink-0">
                <div className="text-xs sm:text-sm text-secondary-500 dark:text-secondary-300 bg-white/80 dark:bg-black/30 px-3 sm:px-4 py-2 rounded-xl backdrop-blur-sm border border-secondary-200 dark:border-white/10">
            {finalSchoolData.schoolInfo.board} Board • Last updated: {new Date().toLocaleString()}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card hover className="overflow-hidden animate-slide-up">
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-semibold text-secondary-600 uppercase tracking-wide truncate">Total Students</p>
                 <p className="text-2xl sm:text-3xl font-bold text-secondary-900 dark:text-white mt-2">{finalSchoolData.schoolInfo.totalStudents}</p>
                <div className="mt-2 flex items-center">
                  <span className="text-xs sm:text-sm font-medium text-success-600">+12%</span>
                  <span className="text-xs text-secondary-500 ml-1">from last month</span>
                </div>
              </div>
              <div className="relative flex-shrink-0">
                 <div className="absolute inset-0 bg-white rounded-xl opacity-20"></div>
                <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                  <UserGroupIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card hover className="overflow-hidden animate-slide-up" style={{ animationDelay: '100ms' }}>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-semibold text-secondary-600 uppercase tracking-wide truncate">Total Classes</p>
                 <p className="text-2xl sm:text-3xl font-bold text-secondary-900 dark:text-white mt-2">{finalSchoolData.schoolInfo.totalClasses}</p>
                <div className="mt-2 flex items-center">
                  <span className="text-xs sm:text-sm font-medium text-success-600">+8%</span>
                  <span className="text-xs text-secondary-500 ml-1">from last month</span>
                </div>
              </div>
              <div className="relative flex-shrink-0">
                 <div className="absolute inset-0 bg-white rounded-xl opacity-20"></div>
                <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl flex items-center justify-center shadow-lg">
                  <AcademicCapIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card hover className="overflow-hidden animate-slide-up" style={{ animationDelay: '200ms' }}>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-semibold text-secondary-600 uppercase tracking-wide truncate">Avg. Performance</p>
                 <p className="text-2xl sm:text-3xl font-bold text-secondary-900 dark:text-white mt-2">86.2%</p>
                <div className="mt-2 flex items-center">
                  <span className="text-xs sm:text-sm font-medium text-success-600">+5%</span>
                  <span className="text-xs text-secondary-500 ml-1">from last month</span>
                </div>
              </div>
              <div className="relative flex-shrink-0">
                 <div className="absolute inset-0 bg-white rounded-xl opacity-20"></div>
                <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl flex items-center justify-center shadow-lg">
                  <ChartBarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card hover className="overflow-hidden animate-slide-up" style={{ animationDelay: '300ms' }}>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-semibold text-secondary-600 uppercase tracking-wide truncate">Top Performer</p>
                 <p className="text-2xl sm:text-3xl font-bold text-secondary-900 dark:text-white mt-2">830 pts</p>
                <div className="mt-2 flex items-center">
                  <span className="text-xs sm:text-sm font-medium text-success-600">Ahan K.</span>
                  <span className="text-xs text-secondary-500 ml-1">Class 8</span>
                </div>
              </div>
              <div className="relative flex-shrink-0">
                 <div className="absolute inset-0 bg-white rounded-xl opacity-20"></div>
                <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-amber-600 to-amber-700 rounded-xl flex items-center justify-center shadow-lg">
                  <TrophyIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:gap-8 lg:grid-cols-2">
        {/* Class-wise Enrollment */}
        <Card className="animate-slide-up" style={{ animationDelay: '400ms' }}>
          <CardHeader>
            <CardTitle gradient className="text-lg sm:text-xl">Class-wise Student Enrollment</CardTitle>
            <p className="text-xs sm:text-sm text-secondary-600 mt-1">Student distribution across different grades</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250} className="sm:h-[280px]">
              <BarChart data={finalSchoolData.classwiseEnrollment}>
                <defs>
                  <linearGradient id="enrollmentGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.6}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="class" stroke="#64748b" fontSize={10} className="text-xs" />
                <YAxis stroke="#64748b" fontSize={10} className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                    fontSize: '12px'
                  }} 
                />
                <Bar 
                  dataKey="students" 
                  fill="url(#enrollmentGradient)"
                  radius={[6, 6, 0, 0]}
                  name="Students"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance Distribution */}
        <Card className="animate-slide-up" style={{ animationDelay: '500ms' }}>
          <CardHeader>
            <CardTitle gradient className="text-lg sm:text-xl">Performance Distribution</CardTitle>
            <p className="text-xs sm:text-sm text-secondary-600 mt-1">Overall accuracy breakdown across all students</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250} className="sm:h-[280px]">
              <PieChart>
                <Pie
                  data={performanceDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ value }) => `${value}%`}
                >
                  {performanceDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {performanceDistribution.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs sm:text-sm text-gray-600 truncate">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top 10 Leaderboard */}
      <Card className="animate-slide-up" style={{ animationDelay: '600ms' }}>
        <CardHeader>
          <CardTitle gradient className="text-lg sm:text-xl flex items-center">
            <TrophyIcon className="w-5 h-5 mr-2 text-amber-500" />
            🏆 School Leaderboard - Top 10 Champions
          </CardTitle>
          <p className="text-xs sm:text-sm text-secondary-600 mt-1">Our highest performing students this month with points and achievements</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {finalSchoolData.topStudents.map((student: any) => (
              <div key={student.id} className="relative group">
                <Card hover className="overflow-hidden transition-all duration-300 group-hover:scale-105 border-2 border-transparent group-hover:border-gradient-to-r group-hover:from-amber-400 group-hover:to-orange-500">
                  <CardContent className="p-4 relative">
                    <div className="text-center">
                      {/* Rank Badge */}
                      <div className={`absolute -top-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg ${
                        student.rank === 1 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                        student.rank === 2 ? 'bg-gradient-to-r from-gray-400 to-gray-600' :
                        student.rank === 3 ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
                        'bg-gradient-to-r from-blue-400 to-blue-600'
                      }`}>
                        #{student.rank}
                      </div>
                      
                      {/* Achievement Badge */}
                      <div className="absolute -top-1 -left-1 text-lg">
                        {student.badge}
                      </div>
                      
                      {/* Student Photo */}
                      <div className="relative mb-3">
                        <div className={`absolute inset-0 rounded-full ${
                          student.rank <= 3 ? 'animate-pulse bg-gradient-to-r from-amber-200 to-yellow-200' : ''
                        }`}></div>
                        <img 
                          src={student.photo} 
                          alt={student.name}
                          className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto object-cover shadow-lg ${
                            student.rank === 1 ? 'border-4 border-yellow-400' :
                            student.rank === 2 ? 'border-4 border-gray-400' :
                            student.rank === 3 ? 'border-4 border-orange-400' :
                            'border-4 border-blue-300'
                          }`}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=3b82f6&color=fff&size=150`;
                          }}
                        />
                        {student.rank <= 3 && (
                          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                            <span className="text-2xl filter drop-shadow-md">{student.badge}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Student Info */}
                       <h3 className="font-bold text-sm text-secondary-900 dark:text-white truncate mb-1">{student.name}</h3>
                      <p className="text-xs text-secondary-600 mb-2">{student.class}</p>
                      
                      {/* Points Display */}
                      <div className="mb-3">
                        <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold text-white shadow-md ${
                          student.rank === 1 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                          student.rank === 2 ? 'bg-gradient-to-r from-gray-500 to-gray-600' :
                          student.rank === 3 ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
                          'bg-gradient-to-r from-blue-500 to-blue-600'
                        }`}>
                          {student.xpPoints} pts
                        </div>
                      </div>
                      
                      {/* Performance Metrics */}
                      <div className="space-y-2 text-xs">
                        <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getPerformanceColor(student.accuracy)}`}>
                          {student.accuracy}% Accuracy
                        </div>
                        <div className="flex items-center justify-center space-x-2 text-secondary-600">
                          <div className="flex items-center">
                            <StarIcon className="w-3 h-3 text-amber-400 mr-1" />
                            <span>{student.lessonsCompleted}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                            <span>{student.streak} day streak</span>
                          </div>
                        </div>
                      </div>
                      
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full mt-3 text-xs hover:scale-105 transition-transform"
                        onClick={() => {
                          // Assign a random learning level on view
                          const randomLevel = learningLevels[Math.floor(Math.random() * learningLevels.length)];
                          setSelectedStudent({ ...student, assignedLevel: randomLevel });
                        }}
                      >
                        <EyeIcon className="w-3 h-3 mr-1" />
                        View Profile
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
          
          {/* Leaderboard Stats */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border border-yellow-200">
              <div className="text-2xl mb-1">🏆</div>
              <p className="text-sm font-bold text-amber-800">Top Scorer</p>
              <p className="text-xs text-amber-600">Ahan Kumar - 830 pts</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <div className="text-2xl mb-1">🔥</div>
              <p className="text-sm font-bold text-green-800">Longest Streak</p>
              <p className="text-xs text-green-600">Ahan Kumar - 15 days</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
              <div className="text-2xl mb-1">⚡</div>
              <p className="text-sm font-bold text-blue-800">Most Lessons</p>
              <p className="text-xs text-blue-600">Ahan Kumar - 68 lessons</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* All Students Section */}
      <Card className="animate-slide-up" style={{ animationDelay: '700ms' }}>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <CardTitle gradient className="text-lg sm:text-xl">All Students</CardTitle>
              <p className="text-xs sm:text-sm text-secondary-600 mt-1">Complete student directory with performance details</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400" />
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <select 
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-3 py-2 border border-secondary-200 dark:border-white/10 rounded-lg text-sm bg-white dark:bg-black/30 dark:text-white"
              >
                <option value="all">All Classes</option>
                {finalSchoolData.classwiseEnrollment.map((cls: any) => (
                  <option key={cls.class} value={cls.class}>{cls.class}</option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Students Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...finalSchoolData.topStudents, ...finalSchoolData.allStudents]
              .filter(student => 
                (selectedClass === 'all' || student.class === selectedClass) &&
                (student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 student.class.toLowerCase().includes(searchTerm.toLowerCase()))
              )
              .slice(0, 12) // Show first 12 students
              .map((student) => (
              <Card key={student.id} hover className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={student.photo} 
                      alt={student.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md flex-shrink-0"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=3b82f6&color=fff&size=100`;
                      }}
                    />
                    <div className="min-w-0 flex-1">
                       <h3 className="font-semibold text-sm text-secondary-900 dark:text-white truncate">{student.name}</h3>
                      <p className="text-xs text-secondary-600">{student.class}</p>
                      <div className="flex items-center mt-1 space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPerformanceColor(student.accuracy)}`}>
                          {student.accuracy}%
                        </span>
                        <span className="text-xs text-secondary-500">{student.xpPoints.toLocaleString()} XP</span>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => {
                        // Assign a random learning level on view
                        const randomLevel = learningLevels[Math.floor(Math.random() * learningLevels.length)];
                        setSelectedStudent({ ...student, assignedLevel: randomLevel });
                      }}
                    >
                      <EyeIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Load More Button */}
          <div className="text-center mt-6">
            <Button variant="outline">
                              Load More Students ({finalSchoolData.schoolInfo.totalStudents - 12} remaining)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-black/30 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <img 
                  src={selectedStudent.photo} 
                  alt={selectedStudent.name}
                  className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedStudent.name)}&background=3b82f6&color=fff&size=150`;
                  }}
                />
                <div>
                   <h2 className="text-xl font-bold text-secondary-900 dark:text-white">{selectedStudent.name}</h2>
                  <p className="text-secondary-600">{selectedStudent.class}</p>
                  {selectedStudent.rank && (
                    <div className="flex items-center mt-1">
                      <TrophyIcon className="w-4 h-4 text-amber-500 mr-1" />
                      <span className="text-sm font-medium text-amber-600">Rank #{selectedStudent.rank}</span>
                    </div>
                  )}
                </div>
              </div>
              <Button variant="outline" onClick={() => setSelectedStudent(null)}>
                Close
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Performance Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Performance Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-secondary-500">Overall Accuracy</p>
                       <p className="text-2xl font-bold text-secondary-900 dark:text-white">{selectedStudent.accuracy}%</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-secondary-500">XP Points</p>
                      <p className="text-2xl font-bold text-amber-600">{selectedStudent.xpPoints.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-secondary-500">Lessons Completed</p>
                      <p className="text-2xl font-bold text-green-600">{selectedStudent.lessonsCompleted}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-secondary-500">Time Spent Learning</p>
                      <p className="text-2xl font-bold text-blue-600">{selectedStudent.timeSpent}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Student Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-secondary-500">Class</p>
                       <p className="text-lg font-semibold text-secondary-900 dark:text-white">{selectedStudent.class}</p>
                    </div>
                    {selectedStudent.enrollmentDate && (
                      <div>
                        <p className="text-sm font-medium text-secondary-500">Enrollment Date</p>
                        <p className="text-lg font-semibold text-secondary-900 dark:text-white">
                          {new Date(selectedStudent.enrollmentDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-secondary-500">Learning Status</p>
                      <div className="flex items-center mt-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-sm text-green-600 font-medium">Active Learner</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-secondary-500">Selected Learning Level</p>
                      <div className="mt-2">
                        {selectedStudent.assignedLevel ? (
                          <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold shadow-lg ${selectedStudent.assignedLevel.color}`}>
                            <span className="mr-2 text-base">{selectedStudent.assignedLevel.icon}</span>
                            {selectedStudent.assignedLevel.name}
                          </div>
                        ) : (
                          (() => {
                            const level = selectedStudent.accuracy >= 95 ? 'Expert' :
                                        selectedStudent.accuracy >= 85 ? 'Advanced' :
                                        selectedStudent.accuracy >= 70 ? 'Intermediate' :
                                        selectedStudent.accuracy >= 50 ? 'Beginner' : 'Foundation';
                            const levelObj = learningLevels.find(l => l.name === level)!;
                            return (
                              <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold shadow-lg ${levelObj.color}`}>
                                <span className="mr-2 text-base">{levelObj.icon}</span>
                                {levelObj.name}
                              </div>
                            );
                          })()
                        )}
                        
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
