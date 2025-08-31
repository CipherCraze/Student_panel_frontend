import React, { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getApiBaseUrl } from '../../services/apiFactory'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { DetailModal } from './DetailModal'
import { CreateModal } from './CreateModal'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Database, Users, BookOpen, School, CreditCard, Globe, FileText, BarChart3, TrendingUp, Eye, Plus, RefreshCw, Download, Search } from 'lucide-react'

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

  // Collection analytics and insights
  const collectionStats = useMemo(() => {
    if (!collections.length) return null
    
    return {
      total: collections.length,
      categories: {
        content: collections.filter(c => ['lessons', 'topics', 'chapters', 'exercises', 'learningexercises'].includes(c)).length,
        users: collections.filter(c => ['users', 'userdetails', 'students'].includes(c)).length,
        business: collections.filter(c => ['payments', 'subscriptions', 'subscriptionpurchases'].includes(c)).length,
        system: collections.filter(c => ['schools', 'languages', 'classes'].includes(c)).length,
      }
    }
  }, [collections])

  // Get collection icon
  const getCollectionIcon = (collection: string) => {
    const iconMap: Record<string, any> = {
      users: Users,
      userdetails: Users,
      students: Users,
      lessons: BookOpen,
      topics: BookOpen,
      chapters: BookOpen,
      exercises: FileText,
      learningexercises: FileText,
      schools: School,
      payments: CreditCard,
      subscriptions: CreditCard,
      subscriptionpurchases: CreditCard,
      languages: Globe,
      classes: School,
    }
    return iconMap[collection] || Database
  }

  // Get collection color theme
  const getCollectionTheme = (collection: string) => {
    const themeMap: Record<string, string> = {
      users: 'bg-blue-500',
      userdetails: 'bg-blue-600',
      students: 'bg-indigo-500',
      lessons: 'bg-green-500',
      topics: 'bg-green-600',
      chapters: 'bg-emerald-500',
      exercises: 'bg-purple-500',
      learningexercises: 'bg-purple-600',
      schools: 'bg-orange-500',
      payments: 'bg-yellow-500',
      subscriptions: 'bg-yellow-600',
      subscriptionpurchases: 'bg-amber-500',
      languages: 'bg-pink-500',
      classes: 'bg-red-500',
    }
    return themeMap[collection] || 'bg-gray-500'
  }

  // Collection usage data for charts
  const collectionUsageData = useMemo(() => {
    return collections.map(collection => ({
      name: collection,
      documents: collection === active ? total : Math.floor(Math.random() * 1000) + 50, // Mock data for non-active collections
      icon: getCollectionIcon(collection),
      theme: getCollectionTheme(collection)
    })).sort((a, b) => b.documents - a.documents)
  }, [collections, active, total])

  const colors = ['#8b5cf6', '#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1']

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
    <div className="space-y-6">
      {/* Header with enhanced styling */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
            <Database className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Collections Management</h1>
            <p className="text-gray-600 dark:text-gray-400">Explore and manage your MongoDB collections</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
          >
            <Plus size={16} />
            Create New {active ? active.slice(0, -1) : 'Item'}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => { setPage(1); loadDocs() }}
            className="flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Refresh
          </Button>
          <Button 
            onClick={exportCsv}
            className="flex items-center gap-2"
            variant="outline"
          >
            <Download size={16} />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Analytics Dashboard */}
      {collectionStats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Collection Overview Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="text-indigo-600" size={20} />
                Collection Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{collectionStats.total}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Collections</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{active ? total : 0}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Active Documents</div>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Content</span>
                  <span className="text-sm font-semibold text-purple-600">{collectionStats.categories.content}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Users</span>
                  <span className="text-sm font-semibold text-blue-600">{collectionStats.categories.users}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Business</span>
                  <span className="text-sm font-semibold text-yellow-600">{collectionStats.categories.business}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">System</span>
                  <span className="text-sm font-semibold text-orange-600">{collectionStats.categories.system}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Collection Usage Chart */}
          <Card className="overflow-hidden shadow-lg border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="text-white" size={20} />
                Document Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart 
                  data={collectionUsageData.slice(0, 6)}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  barCategoryGap="25%"
                  barGap={6}
                >
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    axisLine={{ stroke: '#d1d5db', strokeWidth: 1 }}
                    tickLine={{ stroke: '#d1d5db', strokeWidth: 1 }}
                    angle={-25}
                    textAnchor="end"
                    height={70}
                    interval={0}
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: '#6b7280' }} 
                    width={50}
                    axisLine={{ stroke: '#d1d5db', strokeWidth: 1 }}
                    tickLine={{ stroke: '#d1d5db', strokeWidth: 1 }}
                    allowDecimals={false}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#111827',
                      border: 'none',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '13px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                      padding: '12px'
                    }}
                    cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }}
                    formatter={(value) => [`${value} documents`, 'Count']}
                    labelFormatter={(label) => `Collection: ${label}`}
                  />
                  <Bar 
                    dataKey="documents" 
                    fill="url(#enhancedCollectionGradient)" 
                    radius={[8, 8, 0, 0]}
                    stroke="url(#strokeGradient)"
                    strokeWidth={2}
                    maxBarSize={50}
                  />
                  <defs>
                    <linearGradient id="enhancedCollectionGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a855f7" />
                      <stop offset="50%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                    <linearGradient id="strokeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7c3aed" />
                      <stop offset="100%" stopColor="#4f46e5" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Collection Categories Pie Chart */}
          <Card className="overflow-hidden shadow-lg border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
            <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
              <CardTitle className="flex items-center gap-2">
                <Eye className="text-white" size={20} />
                Collection Categories
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col items-center">
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Content', value: collectionStats.categories.content, color: '#8b5cf6' },
                        { name: 'Users', value: collectionStats.categories.users, color: '#06b6d4' },
                        { name: 'Business', value: collectionStats.categories.business, color: '#10b981' },
                        { name: 'System', value: collectionStats.categories.system, color: '#f59e0b' },
                      ].filter(item => item.value > 0)}
                      cx="50%"
                      cy="50%"
                      outerRadius={75}
                      innerRadius={25}
                      dataKey="value"
                      labelLine={false}
                      label={({ cx, cy, midAngle, outerRadius, percent }: any) => {
                        if (!percent || percent < 0.05) return null;
                        const RADIAN = Math.PI / 180;
                        const radius = outerRadius + 20;
                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                        const y = cy + radius * Math.sin(-midAngle * RADIAN);
                        return (
                          <text 
                            x={x} 
                            y={y} 
                            fill="#374151" 
                            textAnchor={x > cx ? 'start' : 'end'} 
                            dominantBaseline="central"
                            fontSize={12}
                            fontWeight="600"
                            className="drop-shadow-sm"
                          >
                            {`${(percent * 100).toFixed(0)}%`}
                          </text>
                        );
                      }}
                      stroke="#fff"
                      strokeWidth={3}
                    >
                      {[
                        { name: 'Content', value: collectionStats.categories.content, color: '#8b5cf6' },
                        { name: 'Users', value: collectionStats.categories.users, color: '#06b6d4' },
                        { name: 'Business', value: collectionStats.categories.business, color: '#10b981' },
                        { name: 'System', value: collectionStats.categories.system, color: '#f59e0b' },
                      ].filter(item => item.value > 0).map((_, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={`url(#pieGradient${index})`}
                          stroke="#fff"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#111827',
                        border: 'none',
                        borderRadius: '12px',
                        color: '#ffffff',
                        fontSize: '13px',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                        padding: '12px'
                      }}
                      itemStyle={{
                        color: '#ffffff',
                        fontWeight: '500'
                      }}
                      labelStyle={{ 
                        color: '#ffffff',
                        fontWeight: '600'
                      }}
                      formatter={(value, name) => [
                        <span style={{ color: '#ffffff' }}>{`${value} collections`}</span>, 
                        <span style={{ color: '#ffffff' }}>{name}</span>
                      ]}
                    />
                    <defs>
                      <linearGradient id="pieGradient0" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#a855f7" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                      <linearGradient id="pieGradient1" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#0891b2" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                      <linearGradient id="pieGradient2" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#059669" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                      <linearGradient id="pieGradient3" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#d97706" />
                        <stop offset="100%" stopColor="#f59e0b" />
                      </linearGradient>
                    </defs>
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Enhanced Legend */}
                <div className="grid grid-cols-2 gap-3 mt-4 w-full">
                  {[
                    { name: 'Content', value: collectionStats.categories.content, color: '#8b5cf6', icon: '📚' },
                    { name: 'Users', value: collectionStats.categories.users, color: '#06b6d4', icon: '👥' },
                    { name: 'Business', value: collectionStats.categories.business, color: '#10b981', icon: '💼' },
                    { name: 'System', value: collectionStats.categories.system, color: '#f59e0b', icon: '⚙️' },
                  ].filter(item => item.value > 0).map((item) => (
                    <div key={item.name} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        {item.icon} {item.name}
                      </span>
                      <span className="text-xs font-bold text-gray-900 dark:text-white ml-auto">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Enhanced Collection Browser */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
          <CardTitle className="flex items-center gap-2">
            <Database className="text-indigo-600" size={20} />
            Collection Browser
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {/* Enhanced Collection Tabs */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2 mb-4">
              {collections.map((name) => {
                const IconComponent = getCollectionIcon(name)
                const isActive = active === name
                return (
                  <button
                    key={name}
                    onClick={() => { setActive(name); setPage(1) }}
                    className={`group relative px-4 py-3 rounded-lg text-sm font-medium border transition-all duration-200 flex items-center gap-2 ${
                      isActive 
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-transparent shadow-lg transform scale-105' 
                        : 'text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
                    }`}
                    title={name}
                  >
                    <IconComponent size={16} className={isActive ? 'text-white' : 'text-gray-500'} />
                    <span className="capitalize">{name}</span>
                    {isActive && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border-2 border-white"></div>
                    )}
                  </button>
                )
              })}
            </div>
            
            {/* Enhanced Search Bar */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={`Search ${active || 'collection'}...`}
                  className="pl-10 pr-4 py-3 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <Button 
                variant="outline" 
                onClick={() => { setPage(1); loadDocs() }}
                className="flex items-center gap-2 px-6"
              >
                <Search size={16} />
                Search
              </Button>
            </div>
          </div>

          {/* Data Stats */}
          <div className="flex items-center justify-between mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-semibold text-indigo-600">{total}</span> total documents
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Page <span className="font-semibold">{page}</span> of <span className="font-semibold">{totalPages}</span>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Collection: <span className="font-semibold text-indigo-600 capitalize">{active}</span>
            </div>
          </div>

          {/* Enhanced Data Display */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
            {loading ? (
              <div className="p-12 text-center">
                <div className="inline-block w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <div className="text-lg font-medium text-gray-600 dark:text-gray-400">Loading documents...</div>
                <div className="text-sm text-gray-500">Please wait while we fetch your data</div>
              </div>
            ) : error ? (
              <div className="p-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
                  <Database className="text-red-600" size={24} />
                </div>
                <div className="text-lg font-medium text-red-600 mb-2">Error Loading Data</div>
                <div className="text-sm text-gray-500">{error}</div>
              </div>
            ) : docs.length === 0 ? (
              <div className="p-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                  <Database className="text-gray-400" size={24} />
                </div>
                <div className="text-lg font-medium text-gray-600 dark:text-gray-400">No Documents Found</div>
                <div className="text-sm text-gray-500 mb-4">
                  {q ? `No results found for "${q}"` : `The ${active} collection is empty`}
                </div>
                <Button 
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2"
                >
                  <Plus size={16} />
                  Create First {active ? active.slice(0, -1) : 'Item'}
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900 max-h-[60vh] overflow-auto">
                {docs.map((d, index) => (
                  <div 
                    key={String(d._id)} 
                    className="group p-4 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-900/10 dark:hover:to-purple-900/10 cursor-pointer transition-all duration-200 border-l-4 border-transparent hover:border-indigo-500"
                    onClick={() => handleItemClick(d)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        {renderItem(d)}
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="text-xs text-gray-400">#{index + 1 + (page - 1) * limit}</div>
                        <Eye size={16} className="text-gray-400 group-hover:text-indigo-600 transition-colors" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Enhanced Pagination */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing <span className="font-semibold text-indigo-600">{docs.length}</span> of <span className="font-semibold text-indigo-600">{total}</span> documents
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
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Page <span className="font-semibold">{page}</span> of <span className="font-semibold">{totalPages}</span>
                </span>
              </div>
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
                className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {[10, 20, 50, 100].map(n => (
                  <option key={n} value={n}>{n} per page</option>
                ))}
              </select>
            </div>
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


