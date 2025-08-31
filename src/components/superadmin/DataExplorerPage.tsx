import React, { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getApiBaseUrl } from '../../services/apiFactory'
import { Button } from '../ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { ChevronDown, ChevronRight, BarChart3, Database, Search } from 'lucide-react'

export const DataExplorerPage: React.FC = () => {
  const { user } = useAuth()
  const [collections, setCollections] = useState<string[]>([])
  const [selected, setSelected] = useState<string>('')
  const [docs, setDocs] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [total, setTotal] = useState(0)
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const isSuperAdmin = user?.role === 'super_admin'
  const baseUrl = getApiBaseUrl()

  // Helper function to get meaningful columns from the data
  const getTableColumns = useMemo(() => {
    if (!docs.length) return ['_id']
    
    const firstDoc = docs[0]
    const allKeys = Object.keys(firstDoc)
    
    // Prioritize common meaningful fields
    const priorityKeys = ['name', 'title', 'email', 'status', 'type', 'role', 'createdAt', 'updatedAt']
    const meaningfulKeys = allKeys.filter(key => 
      priorityKeys.includes(key) || 
      (typeof firstDoc[key] !== 'object' && key !== '_id' && key !== '__v')
    )
    
    // Limit to 5 columns for better display
    return ['_id', ...meaningfulKeys.slice(0, 4)]
  }, [docs])

  // Generate chart data from documents
  const chartData = useMemo(() => {
    if (!docs.length) return null
    
    // Look for categorical fields to visualize
    const categoricalFields = ['status', 'type', 'role', 'category', 'grade']
    const firstDoc = docs[0]
    const fieldToVisualize = categoricalFields.find(field => firstDoc[field] !== undefined)
    
    if (!fieldToVisualize) return null
    
    const counts: Record<string, number> = {}
    docs.forEach(doc => {
      const value = doc[fieldToVisualize] || 'Unknown'
      counts[value] = (counts[value] || 0) + 1
    })
    
    return {
      field: fieldToVisualize,
      data: Object.entries(counts).map(([name, value]) => ({ name, value }))
    }
  }, [docs])

  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff0000']

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedRows(newExpanded)
  }

  useEffect(() => {
    if (!isSuperAdmin) return
    const loadCollections = async () => {
      setError(null)
      try {
        const res = await fetch(`${baseUrl}/admin/db/collections`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data?.message || 'Failed to load collections')
        setCollections(data.collections || [])
        if ((data.collections || []).length > 0) setSelected(data.collections[0])
      } catch (e: any) {
        setError(e?.message || 'Failed to load collections')
      }
    }
    loadCollections()
  }, [isSuperAdmin, baseUrl])

  const loadDocs = async () => {
    if (!selected) return
    setLoading(true)
    setError(null)
    try {
      const url = new URL(`${baseUrl}/admin/db/${selected}`)
      url.searchParams.set('page', String(page))
      url.searchParams.set('limit', String(limit))
      if (q.trim()) url.searchParams.set('q', q.trim())
      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to load documents')
      setDocs(data.data || [])
      setTotal(data.total || 0)
    } catch (e: any) {
      setError(e?.message || 'Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadDocs() }, [selected, page, limit])

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit])

  if (!isSuperAdmin) {
    return (
      <div className="text-sm text-gray-600 dark:text-gray-300">Access restricted to Super Admin.</div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <Database className="text-indigo-600" size={32} />
          Data Explorer
        </h1>
        <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
          Read-only Mode
        </div>
      </div>

      {/* Data Visualization Card */}
      {chartData && chartData.data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="text-indigo-600" size={20} />
              Data Distribution - {chartData.field}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bar Chart */}
              <div className="flex flex-col justify-center">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 text-center">Bar Chart</h4>
                <div className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart 
                      data={chartData.data}
                      margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                      barCategoryGap="20%"
                      barGap={4}
                    >
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 11, fill: '#6b7280' }}
                        axisLine={{ stroke: '#d1d5db', strokeWidth: 1 }}
                        tickLine={{ stroke: '#d1d5db', strokeWidth: 1 }}
                        interval={0}
                        angle={-15}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis 
                        tick={{ fontSize: 11, fill: '#6b7280' }}
                        axisLine={{ stroke: '#d1d5db', strokeWidth: 1 }}
                        tickLine={{ stroke: '#d1d5db', strokeWidth: 1 }}
                        allowDecimals={false}
                        width={40}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#1f2937',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '12px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }}
                        formatter={(value) => [value, `Count`]}
                        labelFormatter={(label) => `Category: ${label}`}
                      />
                      <Bar 
                        dataKey="value" 
                        fill="url(#barGradient)" 
                        radius={[6, 6, 0, 0]}
                        stroke="#4338ca"
                        strokeWidth={1.5}
                        maxBarSize={60}
                      />
                      <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="50%" stopColor="#6366f1" />
                          <stop offset="100%" stopColor="#4338ca" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Pie Chart */}
              <div className="flex flex-col justify-center">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 text-center">Pie Chart</h4>
                <div className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={chartData.data}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {chartData.data.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#1f2937',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '12px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        itemStyle={{
                          color: '#ffffff',
                          fontWeight: '500'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="text-indigo-600" size={20} />
            Collections & Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
            <div className="flex items-center gap-2">
              <label htmlFor="collection-select" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Collection:
              </label>
              <select
                id="collection-select"
                value={selected}
                onChange={(e) => { setSelected(e.target.value); setPage(1) }}
                className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {collections.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center gap-2 flex-1">
              <label htmlFor="search-input" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Search:
              </label>
              <input
                id="search-input"
                placeholder="Search by name, title, email, type, or status..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 flex-1 max-w-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Button 
                variant="outline" 
                onClick={() => { setPage(1); loadDocs() }}
                className="flex items-center gap-2"
              >
                <Search size={16} />
                Search
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total: <span className="font-semibold">{total}</span> documents • 
              Page <span className="font-semibold">{page}</span> of <span className="font-semibold">{totalPages}</span>
            </div>
          </div>

          <div className="overflow-auto border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm max-h-[60vh]">
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <div className="mt-2 text-sm text-gray-500">Loading documents...</div>
              </div>
            ) : docs.length === 0 ? (
              <div className="p-8 text-center">
                <Database className="mx-auto text-gray-400 mb-2" size={32} />
                <div className="text-sm text-gray-500">No documents found</div>
              </div>
            ) : (
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                  <tr>
                    {getTableColumns.map((column) => (
                      <th key={column} className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                        {column}
                      </th>
                    ))}
                    <th className="px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 w-16">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                  {docs.map((d) => (
                    <React.Fragment key={d._id}>
                      <tr className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        {getTableColumns.map((column) => (
                          <td key={column} className="px-4 py-3 text-gray-900 dark:text-white">
                            {column === '_id' ? (
                              <span className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                {String(d[column]).slice(-8)}...
                              </span>
                            ) : (
                              <span className={`${typeof d[column] === 'object' ? 'text-gray-500 italic' : ''}`}>
                                {typeof d[column] === 'object' 
                                  ? '[Object]' 
                                  : d[column] === null 
                                    ? 'null'
                                    : d[column] === undefined
                                      ? '-'
                                      : String(d[column])
                                }
                              </span>
                            )}
                          </td>
                        ))}
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => toggleExpanded(d._id)}
                            className="inline-flex items-center justify-center w-8 h-8 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            aria-label={expandedRows.has(d._id) ? 'Collapse details' : 'Expand details'}
                          >
                            {expandedRows.has(d._id) ? (
                              <ChevronDown size={16} />
                            ) : (
                              <ChevronRight size={16} />
                            )}
                          </button>
                        </td>
                      </tr>
                      {expandedRows.has(d._id) && (
                        <tr>
                          <td colSpan={getTableColumns.length + 1} className="bg-gray-50 dark:bg-gray-800 px-4 py-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="max-h-64 overflow-auto">
                              <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Full Document JSON:</div>
                              <pre className="text-xs bg-white dark:bg-gray-900 p-3 rounded border border-gray-200 dark:border-gray-700 whitespace-pre-wrap break-all text-gray-700 dark:text-gray-300">
                                {JSON.stringify(d, null, 2)}
                              </pre>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4 gap-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing <span className="font-semibold">{docs.length}</span> of <span className="font-semibold">{total}</span> documents
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                disabled={page <= 1} 
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="flex items-center gap-1"
              >
                ← Previous
              </Button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {page} / {totalPages}
              </span>
              <Button 
                variant="outline" 
                disabled={page >= totalPages} 
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="flex items-center gap-1"
              >
                Next →
              </Button>
              <select
                value={limit}
                onChange={(e) => { setLimit(parseInt(e.target.value) || 20); setPage(1) }}
                className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                {[10, 20, 50, 100].map(n => (
                  <option key={n} value={n}>{n} per page</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
