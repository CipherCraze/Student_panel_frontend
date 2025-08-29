import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { EyeIcon, TrophyIcon, UserGroupIcon, AcademicCapIcon } from '@heroicons/react/24/outline'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { useAuth } from '../../contexts/AuthContext'
import { useEffect, useMemo, useState } from 'react'
import { studentsApi, analyticsApi, getApiBaseUrl } from '../../services/apiFactory'

const defaultPerformanceData = [
  { name: 'Excellent (85-100%)', value: 35, color: '#10b981' },
  { name: 'Good (70-84%)', value: 45, color: '#f59e0b' },
  { name: 'Needs Improvement (<70%)', value: 20, color: '#ef4444' }
]

const defaultSkillAnalytics = [
  { skill: 'Vocabulary', average: 82, improvement: 5, color: '#3b82f6' },
  { skill: 'Grammar', average: 78, improvement: 8, color: '#10b981' },
  { skill: 'Pronunciation', average: 76, improvement: 12, color: '#f59e0b' },
  { skill: 'Listening', average: 85, improvement: 3, color: '#8b5cf6' },
  { skill: 'Speaking', average: 74, improvement: 15, color: '#ef4444' }
]

const defaultEngagementData = [
  { month: 'Jan', avgTime: 45, lessons: 12 },
  { month: 'Feb', avgTime: 52, lessons: 15 },
  { month: 'Mar', avgTime: 48, lessons: 18 },
  { month: 'Apr', avgTime: 55, lessons: 20 },
  { month: 'May', avgTime: 58, lessons: 22 }
]

// Enhanced data for top performing schools with more details
const topPerformingSchools = [
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
    badges: ['🏆', '⭐', '🔥']
  },
  { 
    id: '2',
    name: 'Riverside High School',
    board: 'ICSE',
    accuracy: 92.5,
    students: 456,
    activeStudents: 423,
    improvement: '+5%',
    region: 'South Mumbai',
    totalLessons: 4234,
    avgSessionTime: '26 min',
    adminContact: 'michael@riverside.edu',
    rank: 2,
    badges: ['🥈', '💎']
  },
  { 
    id: '3',
    name: 'Greenwood Elementary',
    board: 'CBSE',
    accuracy: 89.7,
    students: 245,
    activeStudents: 238,
    improvement: '+12%',
    region: 'North Delhi',
    totalLessons: 1892,
    avgSessionTime: '24 min',
    adminContact: 'sarah@greenwood.edu',
    rank: 3,
    badges: ['🥉', '📈']
  },
  { 
    id: '4',
    name: 'Knowledge Heights School',
    board: 'CBSE',
    accuracy: 87.4,
    students: 189,
    activeStudents: 176,
    improvement: '+15%',
    region: 'Hyderabad',
    totalLessons: 1567,
    avgSessionTime: '22 min',
    adminContact: 'priya@knowledgeheights.edu',
    rank: 4,
    badges: ['🌟']
  },
  { 
    id: '5',
    name: 'Oakwood International',
    board: 'Cambridge',
    accuracy: 85.8,
    students: 278,
    activeStudents: 251,
    improvement: '+3%',
    region: 'Bangalore',
    totalLessons: 2156,
    avgSessionTime: '25 min',
    adminContact: 'admin@oakwood.edu',
    rank: 5,
    badges: ['⭐']
  },
  { 
    id: '6',
    name: 'Pine Valley School',
    board: 'State Board',
    accuracy: 83.9,
    students: 198,
    activeStudents: 187,
    improvement: '+7%',
    region: 'Chennai',
    totalLessons: 1423,
    avgSessionTime: '21 min',
    adminContact: 'contact@pinevalley.edu',
    rank: 6,
    badges: ['📚']
  }
]

type StudentRow = {
  id: string
  name: string
  class: string
  performance?: any
}

export function AnalyticsPage() {
  const { user } = useAuth()
  const [selectedSchool, setSelectedSchool] = useState<any>(null)
  const isSuperAdmin = user?.role === 'super_admin'

  // Editable reports state
  const [students, setStudents] = useState<StudentRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [classFilter, setClassFilter] = useState<string>('')
  const [savingIds, setSavingIds] = useState<Record<string, boolean>>({})
  const [edits, setEdits] = useState<Record<string, Partial<{ classTests: number; assignments: number; attendance: number; midTerm: number; finals: number; discipline: string }>>>({})
  const [performanceData, setPerformanceData] = useState(defaultPerformanceData)
  const [skillAnalytics, setSkillAnalytics] = useState(defaultSkillAnalytics)
  const [engagementData, setEngagementData] = useState(defaultEngagementData)

  // Super Admin: live high-level metrics
  const baseUrl = getApiBaseUrl()
  const [saLoading, setSaLoading] = useState(false)
  const [saError, setSaError] = useState<string | null>(null)
  const [saStats, setSaStats] = useState<{ activeUsers7d: number; submissions7d: number; topLanguage?: string; newLessons30d: number; activeSubscriptions: number }>({ activeUsers7d: 0, submissions7d: 0, topLanguage: '-', newLessons30d: 0, activeSubscriptions: 0 })

  useEffect(() => {
    if (!isSuperAdmin) return
    const load = async () => {
      setSaLoading(true)
      setSaError(null)
      try {
        const token = localStorage.getItem('token')
        const headers: any = token ? { Authorization: `Bearer ${token}` } : {}
        const now = new Date()
        const dt7 = new Date(now.getTime() - 7*24*60*60*1000).toISOString()
        const dt30 = new Date(now.getTime() - 30*24*60*60*1000).toISOString()

        // Active users in last 7d (users updatedAt >= dt7)
        const usersRes = await fetch(`${baseUrl}/admin/db/users?limit=1&where=${encodeURIComponent(JSON.stringify({ updatedAt: { $gte: dt7 } }))}`, { headers })
        const users = await usersRes.json()
        const activeUsers7d = users?.total || 0

        // Submissions last 7d (roleplaysubmissions OR learningsubmissions)
        const rps = await fetch(`${baseUrl}/admin/db/roleplaysubmissions?limit=1&where=${encodeURIComponent(JSON.stringify({ createdAt: { $gte: dt7 } }))}`, { headers })
        const rpData = await rps.json()
        const lns = await fetch(`${baseUrl}/admin/db/learningsubmissions?limit=1&where=${encodeURIComponent(JSON.stringify({ createdAt: { $gte: dt7 } }))}`, { headers })
        const lnData = await lns.json()
        const submissions7d = (rpData?.total || 0) + (lnData?.total || 0)

        // New lessons in last 30d
        const lessonsRes = await fetch(`${baseUrl}/admin/db/lessons?limit=1&where=${encodeURIComponent(JSON.stringify({ createdAt: { $gte: dt30 } }))}`, { headers })
        const lessons = await lessonsRes.json()
        const newLessons30d = lessons?.total || 0

        // Active subscriptions
        const subsRes = await fetch(`${baseUrl}/admin/db/subscriptions?limit=1&where=${encodeURIComponent(JSON.stringify({ status: 'active' }))}`, { headers })
        const subs = await subsRes.json()
        const activeSubscriptions = subs?.total || 0

        // Top language by lessons (keys in text)
        const sample = await fetch(`${baseUrl}/admin/db/lessons?limit=200`, { headers })
        const sampleData = await sample.json()
        const countLang: Record<string, number> = {}
        ;(sampleData?.data || []).forEach((l: any) => {
          const keys = l?.text ? Object.keys(l.text) : []
          keys.forEach(k => { countLang[k] = (countLang[k] || 0) + 1 })
        })
        const topLanguage = Object.entries(countLang).sort((a,b)=>b[1]-a[1])[0]?.[0]

        setSaStats({ activeUsers7d, submissions7d, newLessons30d, activeSubscriptions, topLanguage })
      } catch (e: any) {
        setSaError(e?.message || 'Failed to load analytics')
      } finally {
        setSaLoading(false)
      }
    }
    load()
  }, [isSuperAdmin, baseUrl])

  useEffect(() => {
    let isMounted = true
    const fetchStudents = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await studentsApi.getAll(user?.schoolId)
        if (!isMounted) return
        setStudents(data as unknown as StudentRow[])
        // Load analytics in parallel
        const params: Record<string,string> = {}
        if (user?.schoolId) params.schoolId = String(user.schoolId)
        Promise.all([
          analyticsApi.getPerformanceDistribution(params).catch(() => null),
          analyticsApi.getSkillAnalytics(params).catch(() => null),
          analyticsApi.getEngagementTrends(params).catch(() => null),
        ]).then((results) => {
          if (!isMounted) return
          const [dist, skills, trends] = results
          if (dist && typeof dist === 'object') {
            // Expecting shape like { excellent: n, good: n, needsImprovement: n }
            const mapped = [
              { name: 'Excellent (85-100%)', value: dist.excellent ?? 0, color: '#10b981' },
              { name: 'Good (70-84%)', value: dist.good ?? 0, color: '#f59e0b' },
              { name: 'Needs Improvement (<70%)', value: dist.needsImprovement ?? 0, color: '#ef4444' }
            ]
            setPerformanceData(mapped)
          }
          if (Array.isArray(skills)) {
            const palette = ['#3b82f6','#10b981','#f59e0b','#8b5cf6','#ef4444']
            setSkillAnalytics(skills.map((s: any, idx: number) => ({
              skill: s.skill || `Skill ${idx+1}`,
              average: Math.round((s.average ?? 0) * 10) / 10,
              improvement: s.improvement ?? 0,
              color: palette[idx % palette.length]
            })))
          }
          if (Array.isArray(trends)) {
            setEngagementData(trends.map((t: any) => ({
              month: t.month || '',
              avgTime: t.avgTime ?? 0,
              lessons: t.lessons ?? 0
            })))
          }
        })
      } catch (e: any) {
        setError(e?.message || 'Failed to load students')
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    fetchStudents()
    return () => { isMounted = false }
  }, [user?.schoolId])

  const classes = useMemo(() => {
    const set = new Set<string>()
    students.forEach(s => { if (s.class) set.add(s.class) })
    return Array.from(set).sort()
  }, [students])

  const filtered = useMemo(() => {
    return classFilter ? students.filter(s => s.class === classFilter) : students
  }, [students, classFilter])

  const onEdit = (id: string, field: keyof NonNullable<typeof edits[string]>, value: string | number) => {
    setEdits(prev => ({
      ...prev,
      [id]: { ...(prev[id] || {}), [field]: typeof value === 'string' && ['classTests','assignments','attendance','midTerm','finals'].includes(field as string) ? Number(value) : value }
    }))
  }

  const saveRow = async (row: StudentRow) => {
    setSavingIds(prev => ({ ...prev, [row.id]: true }))
    try {
      const currentAssessments = row.performance?.assessments || {}
      const update = {
        performance: {
          ...(row.performance || {}),
          assessments: {
            ...currentAssessments,
            ...edits[row.id],
          },
        },
      }
      const updated = await studentsApi.update(row.id, update as any)
      // Update local list
      setStudents(prev => prev.map(s => s.id === row.id ? (updated as any) : s))
      setEdits(prev => { const { [row.id]: _, ...rest } = prev; return rest })
    } catch (e: any) {
      setError(e?.message || 'Save failed')
    } finally {
      setSavingIds(prev => ({ ...prev, [row.id]: false }))
    }
  }

  const refreshData = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await studentsApi.getAll(user?.schoolId)
      setStudents(data as unknown as StudentRow[])
    } catch (e: any) {
      setError(e?.message || 'Failed to refresh')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Analytics & Reports</h1>
      </div>

      {/* Super Admin Live Metrics */}
      {isSuperAdmin && (
        <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-5">
          <Card><CardContent className="p-4 sm:p-6"><div><p className="text-xs sm:text-sm font-medium text-gray-600">Active Users (7d)</p><p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{saStats.activeUsers7d}</p></div></CardContent></Card>
          <Card><CardContent className="p-4 sm:p-6"><div><p className="text-xs sm:text-sm font-medium text-gray-600">Submissions (7d)</p><p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{saStats.submissions7d}</p></div></CardContent></Card>
          <Card><CardContent className="p-4 sm:p-6"><div><p className="text-xs sm:text-sm font-medium text-gray-600">New Lessons (30d)</p><p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{saStats.newLessons30d}</p></div></CardContent></Card>
          <Card><CardContent className="p-4 sm:p-6"><div><p className="text-xs sm:text-sm font-medium text-gray-600">Active Subscriptions</p><p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{saStats.activeSubscriptions}</p></div></CardContent></Card>
          <Card><CardContent className="p-4 sm:p-6"><div><p className="text-xs sm:text-sm font-medium text-gray-600">Top Language</p><p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{saStats.topLanguage || '-'}</p></div></CardContent></Card>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Learning Hours</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">2,847</p>
                <p className="text-xs sm:text-sm text-green-600">+12% from last month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Lessons Completed</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">1,892</p>
                <p className="text-xs sm:text-sm text-green-600">+18% from last month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Average Session Time</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">24 min</p>
                <p className="text-xs sm:text-sm text-green-600">+8% from last month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Active Students</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">1,156</p>
                <p className="text-xs sm:text-sm text-green-600">+5% from last month</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Performance Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Student Performance Distribution</CardTitle>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-secondary-300 mt-1">Overall accuracy breakdown across all students</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={performanceData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ value }) => `${value}%`}
                >
                  {performanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {performanceData.map((item, index) => (
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

        {/* Skill Areas Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Average Performance by Skill Area</CardTitle>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-secondary-300 mt-1">Individual skill performance metrics and improvements</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {skillAnalytics.map((skill, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm font-medium text-gray-700 truncate">{skill.skill}</span>
                    <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white flex-shrink-0">{skill.average}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3 relative overflow-hidden">
                    <div 
                      className="h-2 sm:h-3 rounded-full transition-all duration-1000 ease-out"
                      style={{ 
                        width: `${skill.average}%`,
                        background: `linear-gradient(90deg, ${skill.color}dd, ${skill.color}aa)`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            
            {/* Alternative: Simple Bar Chart */}
            <div className="mt-6 sm:mt-8">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={skillAnalytics} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="skill" 
                    stroke="#64748b" 
                    fontSize={10}
                    angle={-45}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    stroke="#64748b" 
                    fontSize={10}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                      fontSize: '12px'
                    }}
                    formatter={(value) => [`${value}%`, 'Average Score']}
                  />
                  <Bar 
                    dataKey="average" 
                    radius={[3, 3, 0, 0]}
                    name="Average Score"
                  >
                    {skillAnalytics.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Student Engagement Trends</CardTitle>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Monthly engagement patterns and learning time</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={engagementData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={10} />
              <YAxis yAxisId="left" stroke="#64748b" fontSize={10} />
              <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={10} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                  fontSize: '12px'
                }}
              />
              <Bar yAxisId="left" dataKey="avgTime" fill="#3b82f6" name="Avg. Time (minutes)" radius={[2, 2, 0, 0]} />
              <Bar yAxisId="right" dataKey="lessons" fill="#10b981" name="Lessons Completed" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Editable Reports Grid */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-lg sm:text-xl">Editable Performance Reports</CardTitle>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-secondary-300 mt-1">Edit class tests, assignments, attendance, mid term, finals, and discipline for each student</p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Classes</option>
                {classes.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <Button variant="outline" onClick={refreshData}>Refresh</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-3 text-sm text-red-600">{error}</div>
          )}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class Tests</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignments</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance %</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mid Term</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Finals</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discipline</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-6 text-center text-sm text-gray-500">Loading...</td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-6 text-center text-sm text-gray-500">No students found</td>
                  </tr>
                ) : (
                  filtered.map((s) => {
                    const a = s.performance?.assessments || {}
                    const e = edits[s.id] || {}
                    return (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm text-gray-900">{s.name}</td>
                        <td className="px-4 py-2 text-sm text-gray-700">{s.class || '-'}</td>
                        <td className="px-4 py-2">
                          <input type="number" min={0} max={100} defaultValue={a.classTests ?? 0} onChange={(ev)=>onEdit(s.id,'classTests',ev.target.value)} className="w-24 border border-gray-300 rounded px-2 py-1" />
                        </td>
                        <td className="px-4 py-2">
                          <input type="number" min={0} max={100} defaultValue={a.assignments ?? 0} onChange={(ev)=>onEdit(s.id,'assignments',ev.target.value)} className="w-24 border border-gray-300 rounded px-2 py-1" />
                        </td>
                        <td className="px-4 py-2">
                          <input type="number" min={0} max={100} defaultValue={a.attendance ?? 0} onChange={(ev)=>onEdit(s.id,'attendance',ev.target.value)} className="w-24 border border-gray-300 rounded px-2 py-1" />
                        </td>
                        <td className="px-4 py-2">
                          <input type="number" min={0} max={100} defaultValue={a.midTerm ?? 0} onChange={(ev)=>onEdit(s.id,'midTerm',ev.target.value)} className="w-24 border border-gray-300 rounded px-2 py-1" />
                        </td>
                        <td className="px-4 py-2">
                          <input type="number" min={0} max={100} defaultValue={a.finals ?? 0} onChange={(ev)=>onEdit(s.id,'finals',ev.target.value)} className="w-24 border border-gray-300 rounded px-2 py-1" />
                        </td>
                        <td className="px-4 py-2">
                          <select defaultValue={a.discipline || 'good'} onChange={(ev)=>onEdit(s.id,'discipline',ev.target.value)} className="border border-gray-300 rounded px-2 py-1">
                            <option value="excellent">Excellent</option>
                            <option value="good">Good</option>
                            <option value="average">Average</option>
                            <option value="poor">Poor</option>
                          </select>
                        </td>
                        <td className="px-4 py-2 text-right">
                          <Button size="sm" onClick={() => saveRow(s)} disabled={savingIds[s.id]}>Save</Button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Top Performing Schools - Super Admin Only */}
      {isSuperAdmin && (
        <Card className="animate-slide-up" style={{ animationDelay: '700ms' }}>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <div>
                <CardTitle className="text-lg sm:text-xl flex items-center">
                  <TrophyIcon className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-amber-500" />
                  Top Performing Schools
                </CardTitle>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">Schools ranked by overall student accuracy and engagement</p>
              </div>
              <div className="text-xs sm:text-sm text-gray-500 bg-amber-50 px-3 py-1 rounded-full">
                Super Admin Only
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {topPerformingSchools.map((school, index) => (
                <div key={school.id} className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${
                  index === 0 ? 'border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50' :
                  index === 1 ? 'border-gray-300 bg-gradient-to-r from-gray-50 to-slate-50' :
                  index === 2 ? 'border-orange-300 bg-gradient-to-r from-orange-50 to-amber-50' :
                  'border-gray-200 bg-white hover:border-blue-200'
                }`}>
                  {/* Rank Badge */}
                  <div className={`absolute top-0 left-0 w-12 h-12 flex items-center justify-center text-white font-bold text-sm ${
                    index === 0 ? 'bg-gradient-to-br from-amber-400 to-yellow-500' :
                    index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-500' :
                    index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-500' :
                    'bg-gradient-to-br from-blue-400 to-blue-500'
                  }`}>
                    #{school.rank}
                  </div>

                  <div className="p-4 sm:p-6 ml-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                      {/* School Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-bold text-gray-900 text-base sm:text-lg truncate">{school.name}</h3>
                              <div className="flex space-x-1">
                                {school.badges.map((badge, idx) => (
                                  <span key={idx} className="text-sm">{badge}</span>
                                ))}
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-600">
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                                {school.board}
                              </span>
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                📍 {school.region}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Key Metrics */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4">
                          <div className="text-center p-2 sm:p-3 bg-white/70 rounded-lg border border-gray-100">
                            <div className="text-lg sm:text-xl font-bold text-green-600">{school.accuracy}%</div>
                            <div className="text-xs text-gray-500">Accuracy</div>
                          </div>
                          <div className="text-center p-2 sm:p-3 bg-white/70 rounded-lg border border-gray-100">
                            <div className="text-lg sm:text-xl font-bold text-blue-600">{school.students}</div>
                            <div className="text-xs text-gray-500">Students</div>
                          </div>
                          <div className="text-center p-2 sm:p-3 bg-white/70 rounded-lg border border-gray-100">
                            <div className="text-lg sm:text-xl font-bold text-purple-600">{school.totalLessons}</div>
                            <div className="text-xs text-gray-500">Lessons</div>
                          </div>
                          <div className="text-center p-2 sm:p-3 bg-white/70 rounded-lg border border-gray-100">
                            <div className="text-lg sm:text-xl font-bold text-orange-600">{school.avgSessionTime}</div>
                            <div className="text-xs text-gray-500">Avg Time</div>
                          </div>
                        </div>

                        {/* Performance Indicators */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <UserGroupIcon className="w-4 h-4 text-gray-500" />
                              <span className="text-xs sm:text-sm text-gray-600">
                                {school.activeStudents}/{school.students} active
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <span className="text-xs sm:text-sm font-medium text-green-600">{school.improvement}</span>
                              <span className="text-xs text-gray-500 dark:text-secondary-300">improvement</span>
                            </div>
                          </div>
                          
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setSelectedSchool(school)}
                            className="w-full sm:w-auto"
                          >
                            <EyeIcon className="w-4 h-4 mr-1" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Performance Summary */}
            <div className="mt-6 p-4 sm:p-6 bg-white rounded-xl border border-secondary-200 dark:border-white/10 dark:bg-black/20">
              <h4 className="text-sm sm:text-base font-semibold text-blue-900 mb-3 flex items-center">
                <AcademicCapIcon className="w-5 h-5 mr-2" />
                Network Performance Summary
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-blue-600">
                    {Math.round(topPerformingSchools.reduce((acc, school) => acc + school.accuracy, 0) / topPerformingSchools.length * 10) / 10}%
                  </div>
                  <div className="text-xs sm:text-sm text-blue-700">Network Average</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-green-600">
                    {topPerformingSchools.reduce((acc, school) => acc + school.students, 0).toLocaleString()}
                  </div>
                  <div className="text-xs sm:text-sm text-green-700">Total Students</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-purple-600">
                    {topPerformingSchools.reduce((acc, school) => acc + school.totalLessons, 0).toLocaleString()}
                  </div>
                  <div className="text-xs sm:text-sm text-purple-700">Total Lessons</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-orange-600">
                    {topPerformingSchools.filter(school => school.activeStudents / school.students > 0.9).length}
                  </div>
                  <div className="text-xs sm:text-sm text-orange-700">High Engagement</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* School Detail Modal */}
      {selectedSchool && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-black/30 rounded-xl p-4 sm:p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                  <span className="mr-3">#{selectedSchool.rank}</span>
                  {selectedSchool.name}
                  <div className="flex space-x-1 ml-2">
                    {selectedSchool.badges.map((badge: string, idx: number) => (
                      <span key={idx} className="text-lg">{badge}</span>
                    ))}
                  </div>
                </h2>
                <p className="text-gray-600 dark:text-secondary-300">{selectedSchool.board} • {selectedSchool.region}</p>
              </div>
              <Button variant="outline" onClick={() => setSelectedSchool(null)}>
                Close
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Performance Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-secondary-300">Overall Accuracy</p>
                      <p className="text-2xl font-bold text-green-600">{selectedSchool.accuracy}%</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-secondary-300">Monthly Improvement</p>
                      <p className="text-2xl font-bold text-blue-600">{selectedSchool.improvement}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-secondary-300">Average Session Time</p>
                      <p className="text-2xl font-bold text-purple-600">{selectedSchool.avgSessionTime}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Student Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Student Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-secondary-300">Total Students</p>
                      <p className="text-2xl font-bold text-blue-600">{selectedSchool.students}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-secondary-300">Active Students</p>
                      <p className="text-2xl font-bold text-green-600">{selectedSchool.activeStudents}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-secondary-300">Engagement Rate</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {Math.round((selectedSchool.activeStudents / selectedSchool.students) * 100)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Learning Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Learning Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Lessons</p>
                      <p className="text-2xl font-bold text-purple-600">{selectedSchool.totalLessons}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-secondary-300">Admin Contact</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedSchool.adminContact}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-secondary-300">Network Rank</p>
                      <p className="text-2xl font-bold text-amber-600">#{selectedSchool.rank}</p>
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
