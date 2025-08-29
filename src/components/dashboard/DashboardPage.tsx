import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { AcademicCapIcon, UserGroupIcon, ChartBarIcon, TrophyIcon } from '@heroicons/react/24/outline'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { getApiBaseUrl } from '../../services/apiFactory'

const mockData = {
  stats: {
    totalSchools: 25,
    totalStudents: 1250,
    activeSchools: 23,
    averageAccuracy: 85.2
  },
  enrollmentTrend: [
    { month: 'Jan', students: 800 },
    { month: 'Feb', students: 920 },
    { month: 'Mar', students: 1050 },
    { month: 'Apr', students: 1180 },
    { month: 'May', students: 1250 }
  ],
  performanceByClass: [
    { class: 'Class 1', accuracy: 82 },
    { class: 'Class 2', accuracy: 85 },
    { class: 'Class 3', accuracy: 88 },
    { class: 'Class 4', accuracy: 84 },
    { class: 'Class 5', accuracy: 86 }
  ]
}

export function DashboardPage() {
  const baseUrl = getApiBaseUrl()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState(mockData.stats)
  const [enrollment, setEnrollment] = useState(mockData.enrollmentTrend)
  const [perfByClass, setPerfByClass] = useState(mockData.performanceByClass)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        // Pull real metrics from atlas via admin db endpoints (super admin)
        const token = localStorage.getItem('token')
        const headers: any = token ? { Authorization: `Bearer ${token}` } : {}
        // Total schools
        const schoolsRes = await fetch(`${baseUrl}/admin/db/schools?limit=1`, { headers })
        const schools = await schoolsRes.json()
        const totalSchools = schools?.total || 0
        // Active schools approx by isDeleted=false
        const activeRes = await fetch(`${baseUrl}/admin/db/schools?limit=1&where=${encodeURIComponent(JSON.stringify({ isDeleted: false }))}`, { headers })
        const activeData = await activeRes.json()
        const activeSchools = activeData?.total || 0
        // Total students (if present)
        const studentsRes = await fetch(`${baseUrl}/admin/db/students?limit=1`, { headers })
        const students = await studentsRes.json()
        const totalStudents = students?.total || 0

        setStats({
          totalSchools,
          activeSchools,
          totalStudents,
          averageAccuracy: 0,
        })

        // Simple trends: use last 5 months counts from lessons as proxy activity
        const lessonsRes = await fetch(`${baseUrl}/admin/db/lessons?limit=50`, { headers })
        const lessons = await lessonsRes.json()
        const byMonth: Record<string, number> = {}
        ;(lessons?.data || []).forEach((l: any) => {
          const dt = l.createdAt ? new Date(l.createdAt) : null
          if (!dt) return
          const key = dt.toLocaleString('en-US', { month: 'short' })
          byMonth[key] = (byMonth[key] || 0) + 1
        })
        const trend = Object.entries(byMonth).slice(-5).map(([month, students]) => ({ month, students }))
        if (trend.length) setEnrollment(trend as any)

        // Perf by class placeholder from topics count per name
        const classesRes = await fetch(`${baseUrl}/admin/db/classes?limit=200`, { headers })
        const classesData = await classesRes.json()
        const perf = (classesData?.data || []).slice(0, 8).map((c: any) => ({ class: c.className || c.name || 'Class', accuracy: 70 + Math.floor(Math.random()*20) }))
        if (perf.length) setPerfByClass(perf)
      } catch (e: any) {
        setError(e?.message || 'Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [baseUrl])

  const statCards = [
    {
      title: 'Total Schools',
      value: stats.totalSchools,
      icon: AcademicCapIcon,
      color: 'from-blue-600 to-blue-700',
      bgColor: 'from-blue-50 to-blue-100',
      change: '+12%',
      changeType: 'increase'
    },
    {
      title: 'Total Students',
      value: stats.totalStudents.toLocaleString(),
      icon: UserGroupIcon,
      color: 'from-emerald-600 to-emerald-700',
      bgColor: 'from-emerald-50 to-emerald-100',
      change: '+18%',
      changeType: 'increase'
    },
    {
      title: 'Active Schools',
      value: stats.activeSchools,
      icon: ChartBarIcon,
      color: 'from-purple-600 to-purple-700',
      bgColor: 'from-purple-50 to-purple-100',
      change: '+5%',
      changeType: 'increase'
    },
    {
      title: 'Avg. Accuracy',
      value: `${stats.averageAccuracy}%`,
      icon: TrophyIcon,
      color: 'from-amber-600 to-amber-700',
      bgColor: 'from-amber-50 to-amber-100',
      change: '+3%',
      changeType: 'increase'
    }
  ]

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold gradient-text">Dashboard</h1>
          <p className="mt-1 sm:mt-2 text-secondary-600 dark:text-secondary-300 text-sm sm:text-base">Welcome back! Here's what's happening with your schools.</p>
        </div>
        <div className="flex-shrink-0">
          <div className="text-xs sm:text-sm text-secondary-500 dark:text-secondary-300 bg-white px-3 sm:px-4 py-2 rounded-xl border border-secondary-200 dark:bg-black/30 dark:border-white/10">
            Last updated: {new Date().toLocaleString()}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <Card key={index} hover className="overflow-hidden animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-secondary-600 uppercase tracking-wide truncate">{stat.title}</p>
                  <p className="text-2xl sm:text-3xl font-bold text-secondary-900 dark:text-white mt-2">{stat.value}</p>
                  <div className="mt-2 flex items-center">
                    <span className="text-xs sm:text-sm font-medium text-success-600">{stat.change}</span>
                     <span className="text-xs text-secondary-500 dark:text-secondary-300 ml-1">from last month</span>
                  </div>
                </div>
                <div className={`relative flex-shrink-0`}>
               <div className={`absolute inset-0 bg-white rounded-xl opacity-20`}></div>
                  <div className={`relative w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                    <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:gap-8 lg:grid-cols-2">
        {/* Enrollment Trend */}
        <Card className="animate-slide-up" style={{ animationDelay: '400ms' }}>
          <CardHeader>
            <CardTitle gradient className="text-lg sm:text-xl">Student Enrollment Trend</CardTitle>
            <p className="text-xs sm:text-sm text-secondary-600 dark:text-secondary-300 mt-1">Monthly growth in student registrations</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250} className="sm:h-[280px]">
              <LineChart data={enrollment}>
                <defs>
                  <linearGradient id="enrollmentGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={10} className="text-xs" />
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
                <Line 
                  type="monotone" 
                  dataKey="students" 
                  stroke="#0ea5e9" 
                  strokeWidth={2}
                  fill="url(#enrollmentGradient)"
                  dot={{ fill: '#0ea5e9', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#0284c7' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance by Class */}
        <Card className="animate-slide-up" style={{ animationDelay: '500ms' }}>
          <CardHeader>
            <CardTitle gradient className="text-lg sm:text-xl">Average Accuracy by Class</CardTitle>
            <p className="text-xs sm:text-sm text-secondary-600 dark:text-secondary-300 mt-1">Performance metrics across different grade levels</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250} className="sm:h-[280px]">
              <BarChart data={perfByClass}>
                <defs>
                  <linearGradient id="performanceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.6}/>
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
                  dataKey="accuracy" 
                  fill="url(#performanceGradient)"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="animate-slide-up" style={{ animationDelay: '600ms' }}>
        <CardHeader>
          <CardTitle gradient className="text-lg sm:text-xl">Recent Activity</CardTitle>
          <p className="text-xs sm:text-sm text-secondary-600 dark:text-secondary-300 mt-1">Latest updates and notifications</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 sm:space-y-4">
            {[
              { action: 'New school registered', details: 'Greenwood Elementary School', time: '2 hours ago', type: 'school' },
              { action: 'Student enrollment milestone', details: '1,250 total students reached', time: '4 hours ago', type: 'milestone' },
              { action: 'Performance report generated', details: 'Monthly accuracy report for March', time: '1 day ago', type: 'report' },
              { action: 'New admin user created', details: 'admin@bluehills.edu', time: '2 days ago', type: 'user' }
            ].map((activity, index) => (
              <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between py-3 sm:py-4 px-3 sm:px-4 rounded-xl bg-secondary-50/50 border border-secondary-100 hover:bg-secondary-50 transition-colors duration-200 space-y-2 sm:space-y-0">
                <div className="flex items-center">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0 ${
                    activity.type === 'school' ? 'bg-blue-100 text-blue-600' :
                    activity.type === 'milestone' ? 'bg-emerald-100 text-emerald-600' :
                    activity.type === 'report' ? 'bg-purple-100 text-purple-600' :
                    'bg-amber-100 text-amber-600'
                  }`}>
                    {activity.type === 'school' ? <AcademicCapIcon className="w-4 h-4 sm:w-5 sm:h-5" /> :
                     activity.type === 'milestone' ? <TrophyIcon className="w-4 h-4 sm:w-5 sm:h-5" /> :
                     activity.type === 'report' ? <ChartBarIcon className="w-4 h-4 sm:w-5 sm:h-5" /> :
                     <UserGroupIcon className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-semibold text-secondary-900 dark:text-white truncate">{activity.action}</p>
                    <p className="text-xs sm:text-sm text-secondary-600 dark:text-secondary-300 truncate">{activity.details}</p>
                  </div>
                </div>
                <span className="text-xs text-secondary-400 bg-white dark:bg-black/30 dark:text-secondary-300 px-2 sm:px-3 py-1 rounded-full self-start sm:self-auto flex-shrink-0">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
