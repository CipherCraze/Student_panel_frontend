import React, { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getApiBaseUrl } from '../../services/apiFactory'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { DetailModal } from './DetailModal'
import { CreateModal } from './CreateModal'

type CollectionKey = string

export const CollectionsPage: React.FC = () => {
  const { user } = useAuth()
  const isSuperAdmin = user?.role === 'super_admin'
  const baseUrl = getApiBaseUrl()

  const [active, setActive] = useState<CollectionKey>('')
  const [collections, setCollections] = useState<string[]>([])
  const [docs, setDocs] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<any | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit])

  const loadDocs = async () => {
    if (!isSuperAdmin) return
    if (!active) return
    setLoading(true)
    setError(null)
    try {
      const url = new URL(`${baseUrl}/admin/db/${active}`)
      url.searchParams.set('page', String(page))
      url.searchParams.set('limit', String(limit))
      if (q.trim()) url.searchParams.set('q', q.trim())
      const res = await fetch(url.toString(), { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to load documents')
      setDocs(Array.isArray(data.data) ? data.data : [])
      setTotal(data.total || 0)
    } catch (e: any) {
      setError(e?.message || 'Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadDocs() }, [active, page, limit, q])

  useEffect(() => {
    // Load all collections so user can browse everything
    const loadCollections = async () => {
      try {
        const res = await fetch(`${baseUrl}/admin/db/collections`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
        const data = await res.json()
        if (res.ok && Array.isArray(data.collections)) {
          setCollections(data.collections)
          if (!active && data.collections.length > 0) setActive(data.collections[0])
        }
      } catch (_) {}
    }
    loadCollections()
  }, [baseUrl])

  const exportCsv = () => {
    const flat = docs.map((d) => ({ _id: String(d._id), name: d.name || d.title || d.email || '', createdAt: d.createdAt || '', updatedAt: d.updatedAt || '' }))
    const header = Object.keys(flat[0] || { _id: '', name: '', createdAt: '', updatedAt: '' })
    const csv = [header.join(','), ...flat.map(r => header.map(h => JSON.stringify((r as any)[h] ?? '')).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${active}_export_page${page}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleItemClick = (item: any) => {
    setSelectedItem(item)
    setShowDetailModal(true)
  }

  const handleCreate = async (formData: any) => {
    try {
      setLoading(true)
      const url = `${baseUrl}/admin/db/${active}`
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      })
      
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || 'Failed to create item')
      }
      
      const createdItem = await res.json()
      setSelectedItem(createdItem)
      setShowCreateModal(false)
      loadDocs() // Reload data to reflect changes
    } catch (error) {
      console.error('Failed to create item:', error)
      setError('Failed to create item')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (updatedItem: any) => {
    try {
      setLoading(true)
      const url = `${baseUrl}/admin/db/${active}/${updatedItem._id}`
      const res = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updatedItem)
      })
      
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || 'Failed to update item')
      }
      
      const result = await res.json()
      setSelectedItem(result.data)
      loadDocs() // Reload data to reflect changes
    } catch (error) {
      console.error('Failed to update item:', error)
      setError('Failed to update item')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedItem) return
    if (!window.confirm(`Are you sure you want to delete this item?`)) return
    try {
      setLoading(true)
      const url = `${baseUrl}/admin/db/${active}/${selectedItem._id}`
      const res = await fetch(url, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || 'Failed to delete item')
      }
      
      setSelectedItem(null)
      setShowDetailModal(false)
      loadDocs() // Reload data to reflect changes
    } catch (error) {
      console.error('Failed to delete item:', error)
      setError('Failed to update item')
    } finally {
      setLoading(false)
    }
  }

  if (!isSuperAdmin) {
    return <div className="text-sm text-gray-600 dark:text-gray-300">Access restricted to Super Admin.</div>
  }

  const Chip = ({ text, tone = 'gray' }: { text: string; tone?: 'gray'|'green'|'blue'|'amber'|'purple'|'red' }) => {
    const toneMap: Record<string, string> = {
      gray: 'bg-gray-100 text-gray-700 border-gray-200',
      green: 'bg-green-50 text-green-700 border-green-200',
      blue: 'bg-blue-50 text-blue-700 border-blue-200',
      amber: 'bg-amber-50 text-amber-700 border-amber-200',
      purple: 'bg-purple-50 text-purple-700 border-purple-200',
      red: 'bg-red-50 text-red-700 border-red-200',
    }
    return <span className={`px-2 py-0.5 rounded-full border text-xs ${toneMap[tone]}`}>{text}</span>
  }

  const UpdatedAt = ({ value }: { value?: string }) => (
    <div className="mt-1 text-xs text-gray-500">Updated: {value ? new Date(value).toLocaleString() : '-'}</div>
  )

  const TitleLine = ({ title, id }: { title: string; id?: any }) => (
    <>
      <div className="font-semibold text-gray-900 dark:text-white truncate">{title}</div>
      {id && <div className="text-xs text-gray-500">_id: {String(id)}</div>}
    </>
  )

  const renderItem = (d: any) => {
    if (active === 'lessons') {
      const title = d.lessonName || d.name || '(Untitled Lesson)'
      const img = d.lessonBannerImage || d.banner || ''
      const topicId = d.topicId || '-'
      const chapterId = d.chapterId || '-'
      const langs = d.text ? Object.keys(d.text) : []
      return (
        <div className="flex items-start gap-3">
          {img ? <img src={img} alt="banner" className="w-16 h-16 rounded-md object-cover border" /> : <div className="w-16 h-16 rounded-md bg-gray-200" />}
          <div className="min-w-0">
            <div className="font-semibold text-gray-900 dark:text-white truncate">{title}</div>
            <div className="text-xs text-gray-500">_id: {String(d._id)}</div>
            <div className="mt-1 text-xs text-gray-600 dark:text-gray-300 flex flex-wrap gap-2">
              <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">Topic: {String(topicId)}</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">Chapter: {String(chapterId)}</span>
              {langs.length > 0 && (<span className="px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">{langs.length} Langs</span>)}
              {d.isActive === false && (<span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border">Inactive</span>)}
            </div>
            <div className="mt-1 text-xs text-gray-500">Updated: {d.updatedAt ? new Date(d.updatedAt).toLocaleString() : '-'}</div>
          </div>
        </div>
      )
    }
    if (active === 'topics') {
      const title = d.topicName || d.name || '(Untitled Topic)'
      const chapterId = d.chapterId || '-'
      return (
        <div className="min-w-0">
          <TitleLine title={title} id={d._id} />
          <div className="mt-1 text-xs text-gray-600 dark:text-gray-300 flex flex-wrap gap-2">
            <Chip text={`Chapter: ${String(chapterId)}`} tone="amber" />
            {d.isActive === false && (<Chip text="Inactive" />)}
          </div>
          <UpdatedAt value={d.updatedAt} />
        </div>
      )
    }
    if (active === 'users' || active === 'userdetails') {
      const name = d.name || d.fullName || '(No name)'
      const email = d.email || d.contactEmail || '-'
      const avatar = d.avatar || ''
      return (
        <div className="flex items-start gap-3">
          {avatar ? <img src={avatar} alt="avatar" className="w-10 h-10 rounded-full object-cover border" /> : <div className="w-10 h-10 rounded-full bg-gray-200" />}
          <div className="min-w-0">
            <TitleLine title={name} id={d._id} />
            <div className="text-xs text-gray-500 truncate">{email}</div>
            <UpdatedAt value={d.updatedAt} />
          </div>
        </div>
      )
    }

    if (active === 'chapters') {
      const name = d.chapterName || d.name || '(Untitled Chapter)'
      const board = d.board || d.boardId || '-'
      return (
        <div className="min-w-0">
          <TitleLine title={name} id={d._id} />
          <div className="mt-1 flex flex-wrap gap-2 text-xs">
            <Chip text={`Board: ${String(board)}`} tone="blue" />
            {d.order != null && <Chip text={`Order: ${d.order}`} tone="purple" />}
            {d.isActive === false && <Chip text="Inactive" />}
          </div>
          <UpdatedAt value={d.updatedAt} />
        </div>
      )
    }

    if (active === 'classes') {
      const name = d.className || d.name || '(Class)'
      return (
        <div className="min-w-0">
          <TitleLine title={name} id={d._id} />
          <div className="mt-1 flex flex-wrap gap-2 text-xs">
            {d.section && <Chip text={`Section: ${d.section}`} tone="amber" />}
            {d.standard && <Chip text={`Standard: ${d.standard}`} tone="blue" />}
          </div>
          <UpdatedAt value={d.updatedAt} />
        </div>
      )
    }

    if (active === 'roleplays' || active === 'roleplaysubmissions') {
      const title = d.title || d.name || '(Roleplay)'
      const level = d.level || d.roleplayLevel || '-'
      return (
        <div className="min-w-0">
          <TitleLine title={title} id={d._id} />
          <div className="mt-1 flex flex-wrap gap-2 text-xs">
            <Chip text={`Level: ${String(level)}`} tone="purple" />
            {d.score != null && <Chip text={`Score: ${d.score}`} tone="green" />}
            {d.userId && <Chip text={`User: ${String(d.userId)}`} />}
          </div>
          <UpdatedAt value={d.updatedAt} />
        </div>
      )
    }

    if (active === 'subscriptions' || active === 'subscriptionpurchases') {
      const userId = d.userId || d.user || '-'
      const plan = d.plan || d.tier || '-'
      return (
        <div className="min-w-0">
          <TitleLine title={`Subscription`} id={d._id} />
          <div className="mt-1 flex flex-wrap gap-2 text-xs">
            <Chip text={`User: ${String(userId)}`} tone="blue" />
            <Chip text={`Plan: ${String(plan)}`} tone="amber" />
            {d.status && <Chip text={String(d.status)} tone={String(d.status).toLowerCase()==='active'?'green':'gray'} />}
          </div>
          <UpdatedAt value={d.updatedAt} />
        </div>
      )
    }

    if (active === 'payments') {
      const amount = d.amount || d.total || 0
      const currency = d.currency || 'INR'
      return (
        <div className="min-w-0">
          <TitleLine title={`Payment`} id={d._id} />
          <div className="mt-1 flex flex-wrap gap-2 text-xs">
            <Chip text={`Amount: ${currency} ${amount}`} tone="green" />
            {d.status && <Chip text={`Status: ${String(d.status)}`} tone={String(d.status).toLowerCase()==='paid'?'green':'red'} />}
            {d.userId && <Chip text={`User: ${String(d.userId)}`} />}
          </div>
          <UpdatedAt value={d.updatedAt} />
        </div>
      )
    }

    if (active === 'languages') {
      const name = d.name || d.language || '(Language)'
      const code = d.code || d.locale || '-'
      return (
        <div className="min-w-0">
          <TitleLine title={name} id={d._id} />
          <div className="mt-1 flex flex-wrap gap-2 text-xs">
            <Chip text={`Code: ${String(code)}`} tone="blue" />
            {d.isActive === false && <Chip text="Inactive" />}
          </div>
          <UpdatedAt value={d.updatedAt} />
        </div>
      )
    }

    if (active === 'exercises' || active === 'learningexercises') {
      const title = d.title || d.name || '(Exercise)'
      const type = d.type || d.category || '-'
      return (
        <div className="min-w-0">
          <TitleLine title={title} id={d._id} />
          <div className="mt-1 flex flex-wrap gap-2 text-xs">
            <Chip text={`Type: ${String(type)}`} tone="purple" />
            {d.difficulty && <Chip text={`Difficulty: ${String(d.difficulty)}`} />}
          </div>
          <UpdatedAt value={d.updatedAt} />
        </div>
      )
    }

    if (active === 'frequentlyaskedquestions') {
      const q = d.question || '(Question)'
      return (
        <div className="min-w-0">
          <TitleLine title={q} id={d._id} />
          <div className="mt-1 text-xs text-gray-600 dark:text-gray-300 line-clamp-2">{d.answer || ''}</div>
          <UpdatedAt value={d.updatedAt} />
        </div>
      )
    }

    if (active === 'boards') {
      const name = d.name || d.board || '(Board)'
      return (
        <div className="min-w-0">
          <TitleLine title={name} id={d._id} />
          <div className="mt-1 flex flex-wrap gap-2 text-xs">
            {d.country && <Chip text={`Country: ${String(d.country)}`} tone="blue" />}
          </div>
          <UpdatedAt value={d.updatedAt} />
        </div>
      )
    }

    if (active === 'sitesettings' || active === 'termsconditions' || active === 'privacypolicies') {
      const name = d.title || d.key || '(Setting)'
      return (
        <div className="min-w-0">
          <TitleLine title={name} id={d._id} />
          <div className="mt-1 text-xs text-gray-600 dark:text-gray-300 line-clamp-2">{d.description || d.value || ''}</div>
          <UpdatedAt value={d.updatedAt} />
        </div>
      )
    }

    if (active === 'schools') {
      const name = d.schoolName || d.name || '(School)'
      const status = d.isDeleted ? 'Inactive' : 'Active'
      return (
        <div className="min-w-0">
          <TitleLine title={name} id={d._id} />
          <div className="mt-1 flex flex-wrap gap-2 text-xs">
            <Chip text={status} tone={d.isDeleted ? 'red' : 'green'} />
            {d.board && <Chip text={`Board: ${String(d.board)}`} tone="blue" />}
            {d.totalStudents != null && <Chip text={`Students: ${d.totalStudents}`} tone="purple" />}
          </div>
          <UpdatedAt value={d.updatedAt} />
        </div>
      )
    }
    // Fallback simple view
    // Generic, cleaner fallback card
    const title = d.schoolName || d.lessonName || d.topicName || d.chapterName || d.className || d.title || d.name || d.email || '(Item)'
    const subtitleBits: string[] = []
    if (d.type) subtitleBits.push(`Type: ${String(d.type)}`)
    if (d.category) subtitleBits.push(`Category: ${String(d.category)}`)
    if (d.status) subtitleBits.push(`Status: ${String(d.status)}`)
    return (
      <div className="min-w-0">
        <TitleLine title={title} id={d._id} />
        {subtitleBits.length > 0 && (
          <div className="mt-1 text-xs text-gray-600 dark:text-gray-300">{subtitleBits.join(' • ')}</div>
        )}
        <div className="mt-1 flex flex-wrap gap-2 text-xs">
          {typeof d.isActive !== 'undefined' && <Chip text={d.isActive ? 'Active' : 'Inactive'} tone={d.isActive ? 'green' : 'gray'} />}
          {typeof d.isDeleted !== 'undefined' && <Chip text={d.isDeleted ? 'Deleted' : 'Not Deleted'} tone={d.isDeleted ? 'red' : 'gray'} />}
        </div>
        <UpdatedAt value={d.updatedAt} />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Collections</h1>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowCreateModal(true)}>
            Create New {active.slice(0, -1)}
          </Button>
          <Button variant="outline" onClick={() => { setPage(1); loadDocs() }}>Refresh</Button>
          <Button onClick={exportCsv}>Export CSV</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Browse</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {collections.map((name) => (
              <button
                key={name}
                onClick={() => { setActive(name); setPage(1) }}
                className={`px-3 py-1.5 rounded-md text-sm font-medium border ${active === name ? 'bg-indigo-600 text-white border-indigo-600' : 'text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600'}`}
                title={name}
              >
                {name}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={`Search ${active || 'collection'}...`}
                className="border border-gray-300 rounded-md px-3 py-2 w-56 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Button variant="outline" onClick={() => { setPage(1); loadDocs() }}>Search</Button>
            </div>
          </div>

          <div className="text-xs text-gray-500 mb-2">Total: {total} • Page {page}/{totalPages}</div>

          <div className="overflow-auto border rounded-md max-h-[65vh]">
            {loading ? (
              <div className="p-6 text-sm text-gray-500">Loading…</div>
            ) : error ? (
              <div className="p-6 text-sm text-red-600">{error}</div>
            ) : docs.length === 0 ? (
              <div className="p-6 text-sm text-gray-500">No documents</div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                {docs.map((d) => (
                  <div 
                    key={String(d._id)} 
                    className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                    onClick={() => handleItemClick(d)}
                  >
                    {renderItem(d)}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 mt-3">
            <Button variant="outline" disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))}>Prev</Button>
            <span className="text-sm">{page}/{totalPages}</span>
            <Button variant="outline" disabled={page>=totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))}>Next</Button>
            <select
              value={limit}
              onChange={(e)=>{ setLimit(parseInt(e.target.value)||20); setPage(1) }}
              className="border border-gray-300 rounded-md px-2 py-1 text-sm"
            >
              {[10,20,50,100].map(n => <option key={n} value={n}>{n}/page</option>)}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <DetailModal
        item={selectedItem}
        collectionName={active}
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false)
          setSelectedItem(null)
        }}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />

      {/* Create Modal */}
      <CreateModal
        collectionName={active}
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreate}
      />
    </div>
  )
}


