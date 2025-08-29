import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { EyeIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../../contexts/AuthContext'
import { getApiBaseUrl } from '../../services/apiFactory'
import type { School } from '../../types'


export function SchoolsPage() {
  const { user } = useAuth()
  const isSuperAdmin = user?.role === 'super_admin'
  const baseUrl = getApiBaseUrl()
  const [docs, setDocs] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedSchool, setSelectedSchool] = useState<any | null>(null)

  const loadSchools = async () => {
    if (!isSuperAdmin) return
    setLoading(true)
    setError(null)
    try {
      const url = new URL(`${baseUrl}/admin/db/schools`)
      url.searchParams.set('page', String(page))
      url.searchParams.set('limit', String(limit))
      if (searchTerm.trim()) url.searchParams.set('q', searchTerm.trim())
      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to load schools')
      setDocs(Array.isArray(data.data) ? data.data : [])
      setTotal(data.total || 0)
    } catch (e: any) {
      setError(e?.message || 'Failed to load schools')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadSchools() }, [isSuperAdmin, page, limit])

  const schools = useMemo(() => {
    return docs.map((d) => ({
      id: String(d._id),
      name: d.schoolName || d.name || '(unnamed)',
      board: d.board || '-',
      adminContact: {
        name: d.adminContact?.name || '-',
        email: d.adminContact?.email || '-',
        phone: d.adminContact?.phone || '-',
      },
      totalStudents: d.totalStudents || d.studentsCount || 0,
      createdAt: d.createdAt || null,
      status: d.isDeleted ? 'inactive' : 'active',
      _raw: d,
    })) as unknown as School[]
  }, [docs])

  const totalPages = Math.max(1, Math.ceil(total / limit))

  const exportCsv = () => {
    const rows = schools.map(s => ({ id: s.id, name: s.name, board: s.board, status: s.status, createdAt: s.createdAt }))
    const header = Object.keys(rows[0] || { id: '', name: '', board: '', status: '', createdAt: '' })
    const csv = [header.join(','), ...rows.map(r => header.map(h => JSON.stringify((r as any)[h] ?? '')).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `schools_export_page${page}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Schools Management</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { setPage(1); loadSchools() }} className="w-full sm:w-auto">
            Refresh
          </Button>
          <Button onClick={exportCsv} className="w-full sm:w-auto">
            Export CSV
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Search schools by name or board..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="text-sm text-gray-500">Total: {total} • Page {page}/{totalPages}</div>
            <div className="flex items-center gap-2">
              <Button variant="outline" disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))}>Prev</Button>
              <Button variant="outline" disabled={page>=totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))}>Next</Button>
              <select
                value={limit}
                onChange={(e)=>{ setLimit(parseInt(e.target.value)||20); setPage(1) }}
                className="border border-gray-300 rounded-md px-2 py-1 text-sm"
              >
                {[10,20,50,100].map(n => <option key={n} value={n}>{n}/page</option>)}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schools Grid */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full p-6 text-sm text-gray-500">Loading…</div>
        ) : error ? (
          <div className="col-span-full p-6 text-sm text-red-600">{error}</div>
        ) : schools.length === 0 ? (
          <div className="col-span-full p-6 text-sm text-gray-500">No schools found</div>
        ) : schools.map((school) => (
          <Card key={school.id}>
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-start justify-between">
                <CardTitle className="text-base sm:text-lg pr-2">{school.name}</CardTitle>
                <span className={`px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ${
                  school.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {school.status}
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-3">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-500">Board</p>
                  <p className="text-sm text-gray-900 dark:text-secondary-200">{school.board}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-500">Admin Contact</p>
                  <p className="text-sm text-gray-900 dark:text-secondary-200">{school.adminContact.name}</p>
                  <p className="text-xs text-gray-500 truncate">{school.adminContact.email}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-500">Total Students</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{school.totalStudents}</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full sm:w-auto"
                    onClick={() => setSelectedSchool(school)}
                  >
                    <EyeIcon className="w-4 h-4 mr-1" />
                    View
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add School Modal - Simplified for demo */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-black/30 rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg sm:text-xl font-bold mb-4">Add New School</h2>
            <div className="space-y-4">
              <Input label="School Name" placeholder="Enter school name" />
              <Input label="Board" placeholder="CBSE, ICSE, State Board, etc." />
              <Input label="Admin Name" placeholder="Enter admin name" />
              <Input label="Admin Email" type="email" placeholder="admin@school.edu" />
              <Input label="Admin Phone" placeholder="+1-555-0123" />
            </div>
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 mt-6">
              <Button variant="outline" onClick={() => setShowAddForm(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button onClick={() => setShowAddForm(false)} className="w-full sm:w-auto">
                Add School
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* School Detail Modal */}
      {selectedSchool && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-black/30 rounded-lg p-4 sm:p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 space-y-2 sm:space-y-0">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{selectedSchool.name}</h2>
              <Button variant="outline" onClick={() => setSelectedSchool(null)} className="w-full sm:w-auto">
                Close
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Basic School Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">School Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-500">School Name</p>
                      <p className="text-sm text-gray-900 dark:text-secondary-200">{selectedSchool.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Board</p>
                      <p className="text-sm text-gray-900 dark:text-secondary-200">{selectedSchool.board}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Status</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        selectedSchool.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedSchool.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Created Date</p>
                      <p className="text-sm text-gray-900 dark:text-secondary-200">
                        {selectedSchool.createdAt ? new Date(selectedSchool.createdAt).toLocaleDateString() : '-'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Admin Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Admin Contact</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Name</p>
                      <p className="text-sm text-gray-900 dark:text-secondary-200">{selectedSchool.adminContact.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="text-sm text-gray-900 dark:text-secondary-200">{selectedSchool.adminContact.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Phone</p>
                      <p className="text-sm text-gray-900 dark:text-secondary-200">{selectedSchool.adminContact.phone}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* School Statistics */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">School Statistics</CardTitle>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">Overview of school performance and enrollment</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-white dark:bg-white/5 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{selectedSchool.totalStudents}</div>
                      <p className="text-sm font-medium text-blue-800">Total Students</p>
                    </div>
                    <div className="text-center p-4 bg-white dark:bg-white/5 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {Math.round(selectedSchool.totalStudents / 8)}
                      </div>
                      <p className="text-sm font-medium text-green-800">Avg per Class</p>
                    </div>
                    <div className="text-center p-4 bg-white dark:bg-white/5 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">85%</div>
                      <p className="text-sm font-medium text-purple-800">Avg Performance</p>
                    </div>
                    <div className="text-center p-4 bg-white dark:bg-white/5 rounded-lg">
                      <div className="text-2xl font-bold text-amber-600">8</div>
                      <p className="text-sm font-medium text-amber-800">Active Classes</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Recent Activity</CardTitle>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">Latest updates and activities for this school</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-white dark:bg-white/5 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">New student enrollment</p>
                        <p className="text-xs text-gray-500">15 new students enrolled this month</p>
                      </div>
                      <span className="text-xs text-gray-400">2 days ago</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-white dark:bg-white/5 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Performance update</p>
                        <p className="text-xs text-gray-500">Monthly performance reports generated</p>
                      </div>
                      <span className="text-xs text-gray-400">1 week ago</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-white dark:bg-white/5 rounded-lg">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Admin contact updated</p>
                        <p className="text-xs text-gray-500">Contact information verified and updated</p>
                      </div>
                      <span className="text-xs text-gray-400">2 weeks ago</span>
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
