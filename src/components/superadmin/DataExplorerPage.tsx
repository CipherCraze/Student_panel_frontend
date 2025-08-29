import React, { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getApiBaseUrl } from '../../services/apiFactory'
import { Button } from '../ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'

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

  const isSuperAdmin = user?.role === 'super_admin'
  const baseUrl = getApiBaseUrl()

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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Data Explorer (Read-only)</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Collections</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <div className="mb-2 text-sm text-red-600">{error}</div>}
          <div className="flex items-center gap-3 mb-3">
            <select
              value={selected}
              onChange={(e) => { setSelected(e.target.value); setPage(1) }}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {collections.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <input
              placeholder="Search (name/title/email/type/status)"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 w-72 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Button variant="outline" onClick={() => { setPage(1); loadDocs() }}>Search</Button>
          </div>

          <div className="text-xs text-gray-500 mb-2">Total: {total} • Page {page} / {totalPages}</div>

          <div className="overflow-auto border rounded-md max-h-[60vh]">
            {loading ? (
              <div className="p-6 text-sm text-gray-500">Loading…</div>
            ) : docs.length === 0 ? (
              <div className="p-6 text-sm text-gray-500">No documents</div>
            ) : (
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">_id</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">Preview</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                  {docs.map((d) => (
                    <tr key={d._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-3 py-2 text-gray-900 dark:text-white">{String(d._id)}</td>
                      <td className="px-3 py-2">
                        <pre className="text-xs whitespace-pre-wrap break-all text-gray-700 dark:text-gray-300">{JSON.stringify(d, null, 2)}</pre>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="flex items-center justify-between mt-3">
            <div className="text-xs text-gray-500">Showing {docs.length} of {total}</div>
            <div className="flex items-center gap-2">
              <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Button>
              <span className="text-sm">{page}/{totalPages}</span>
              <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</Button>
              <select
                value={limit}
                onChange={(e) => { setLimit(parseInt(e.target.value) || 20); setPage(1) }}
                className="border border-gray-300 rounded-md px-2 py-1 text-sm"
              >
                {[10,20,50,100].map(n => <option key={n} value={n}>{n}/page</option>)}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-xs text-gray-500">Read-only: Edit/Delete disabled by request.</div>
    </div>
  )
}
