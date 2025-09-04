import React, { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { studentsApi } from '../../services/apiFactory'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

interface Student {
  id: string
  name: string
  rollNumber: string
  gender: 'male' | 'female' | 'other'
  class: string
  age: number
  contactNumber?: string
  parentName?: string
  parentContact?: string
  address?: string
  enrollmentDate: string
}

const StudentManagementPage: React.FC = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'classes' | 'students'>('classes')
  const [selectedClass, setSelectedClass] = useState<string>('')
  const [showAddClassModal, setShowAddClassModal] = useState(false)
  const [showAddStudentModal, setShowAddStudentModal] = useState(false)
  const [showEditStudentModal, setShowEditStudentModal] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)

  const [students, setStudents] = useState<Student[]>([])
  const [customClasses, setCustomClasses] = useState<Array<{ id: string; name: string }>>([])

  const [classForm, setClassForm] = useState({ name: '', standard: '', section: '' })
  const [studentForm, setStudentForm] = useState({
    name: '',
    rollNumber: '',
    gender: 'male' as 'male' | 'female' | 'other',
    class: '',
    age: 0,
    contactNumber: '',
    parentName: '',
    parentContact: '',
    address: ''
  })

  // Check if user can perform CRUD operations
  const canPerformCRUD = user?.role === 'super_admin'
  const isReadOnly = user?.role === 'school_admin'

  // Load students from backend (fallback to all if no schoolId)
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const data = user?.schoolId ? await studentsApi.getAll(user.schoolId) : await studentsApi.getAll()
        if (mounted && Array.isArray(data)) setStudents(data as any)
      } catch (_) { /* keep UI stable */ }
    })()
    return () => { mounted = false }
  }, [user?.schoolId])

  // Derive classes from students then union with custom classes
  const derivedClasses = useMemo(() => {
    const set = new Set<string>()
    students.forEach(s => { if (s.class) set.add(s.class) })
    return Array.from(set).sort().map(name => ({ id: name, name }))
  }, [students]) as Array<{ id: string; name: string }>

  const classes = useMemo(() => {
    const map = new Map<string, { id: string; name: string }>()
    ;[...derivedClasses, ...customClasses].forEach(c => map.set(c.name, c))
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [derivedClasses, customClasses])

  const filteredStudents = selectedClass ? students.filter(s => s.class === selectedClass) : students

  const handleAddClass = () => {
    if (!canPerformCRUD) return
    const computedName = classForm.name.trim() || `${classForm.standard}${classForm.section ? ` - ${classForm.section}` : ''}`
    if (!computedName) return
    const newCls = { id: computedName, name: computedName }
    setCustomClasses(prev => (prev.find(c => c.name === computedName) ? prev : [...prev, newCls]))
    setSelectedClass(computedName)
    setShowAddClassModal(false)
    setClassForm({ name: '', standard: '', section: '' })
  }

  const handleDeleteClass = (cls: { id: string; name: string }) => {
    if (!canPerformCRUD) return
    const studentCount = students.filter(s => s.class === cls.name).length
    const confirmMsg = studentCount > 0
      ? `Delete class "${cls.name}" and unassign ${studentCount} student(s)?`
      : `Delete class "${cls.name}"?`
    if (confirm(confirmMsg)) {
      setStudents(prev => prev.filter(s => s.class !== cls.name))
      setCustomClasses(prev => prev.filter(c => c.name !== cls.name))
      if (selectedClass === cls.name) setSelectedClass('')
    }
  }

  const handleAddStudent = async () => {
    if (!canPerformCRUD) return
    if (studentForm.name.trim() && studentForm.rollNumber.trim() && studentForm.class) {
      try {
        const payload: any = {
          name: studentForm.name,
          rollNumber: studentForm.rollNumber,
          gender: studentForm.gender,
          class: studentForm.class,
          // Only send age if valid
          ...(studentForm.age >= 3 ? { age: studentForm.age } : {}),
          contactNumber: studentForm.contactNumber,
          parentName: studentForm.parentName,
          parentContact: studentForm.parentContact,
          address: studentForm.address,
        }
        if (user?.schoolId) payload.schoolId = user.schoolId
        const created = await studentsApi.create(payload)
        setStudents(prev => [...prev, created as any])
        setStudentForm({
          name: '',
          rollNumber: '',
          gender: 'male',
          class: '',
          age: 0,
          contactNumber: '',
          parentName: '',
          parentContact: '',
          address: ''
        })
        setShowAddStudentModal(false)
      } catch (error) {
        console.error('Error adding student:', error)
        alert('Failed to add student.')
      }
    }
  }

  const handleEditStudent = async () => {
    if (!canPerformCRUD) return
    if (editingStudent && studentForm.name.trim() && studentForm.rollNumber.trim()) {
      try {
        const payload: any = {
          name: studentForm.name,
          rollNumber: studentForm.rollNumber,
          gender: studentForm.gender,
          class: studentForm.class,
          // Only send age if valid
          ...(studentForm.age >= 3 ? { age: studentForm.age } : {}),
          contactNumber: studentForm.contactNumber,
          parentName: studentForm.parentName,
          parentContact: studentForm.parentContact,
          address: studentForm.address,
        }
        if (user?.schoolId) payload.schoolId = user.schoolId
        const updated = await studentsApi.update(editingStudent.id, payload)
        setStudents(prev => prev.map(s => s.id === editingStudent.id ? updated as any : s))
        setEditingStudent(null)
        setStudentForm({
          name: '',
          rollNumber: '',
          gender: 'male',
          class: '',
          age: 0,
          contactNumber: '',
          parentName: '',
          parentContact: '',
          address: ''
        })
        setShowEditStudentModal(false)
      } catch (error) {
        console.error('Error updating student:', error)
        alert('Failed to update student.')
      }
    }
  }

  const handleDeleteStudent = async (studentId: string) => {
    if (!canPerformCRUD) return
    if (confirm('Are you sure you want to delete this student?')) {
      try {
        await studentsApi.delete(studentId)
        setStudents(students.filter(s => s.id !== studentId))
      } catch (error) {
        console.error('Error deleting student:', error)
        alert('Failed to delete student.')
      }
    }
  }

  const openEditModal = (student: Student) => {
    setEditingStudent(student)
    setStudentForm({
      name: student.name,
      rollNumber: student.rollNumber,
      gender: student.gender,
      class: student.class,
      age: student.age,
      contactNumber: student.contactNumber || '',
      parentName: student.parentName || '',
      parentContact: student.parentContact || '',
      address: student.address || ''
    })
    setShowEditStudentModal(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Student Management</h1>
          <p className="text-gray-600 dark:text-gray-300">Manage classes and students for your school</p>
        </div>
        <div className="flex space-x-3">
          {canPerformCRUD ? (
            <>
              <Button
                onClick={() => setShowAddClassModal(true)}
                variant="outline"
              >
                Add Class
              </Button>
              <Button
                onClick={() => setShowAddStudentModal(true)}
              >
                Add Student
              </Button>
            </>
          ) : (
            <div className="text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-md">
              {isReadOnly ? '📖 Read-only mode: You can view data but cannot make changes' : '🔒 Access restricted'}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('classes')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'classes'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Classes ({classes.length})
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'students'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Students ({students.length})
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'classes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => (
            <Card key={cls.id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                               <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{cls.name}</h3>
               <span className="text-sm text-gray-500 dark:text-gray-400">
                 {students.filter(s => s.class === cls.name).length} students
               </span>
              </div>
              <div className="space-y-2">
                                 <p className="text-sm text-gray-600 dark:text-gray-300">
                   Class ID: {cls.id}
                 </p>
                {/* Only show standard and section if user is super_admin */}
                {canPerformCRUD && (
                  <>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Standard: {cls.name.split(' - ')[0]}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Section: {cls.name.split(' - ')[1]}</p>
                  </>
                )}
                                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedClass(cls.name)
                        setActiveTab('students')
                      }}
                    >
                      View Students
                    </Button>
                    {canPerformCRUD && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteClass(cls)}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'students' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex space-x-4">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Classes</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.name}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          {/* Students Table */}
          <Card>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                                 <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                       Student
                     </th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                       Class
                     </th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                       Contact
                     </th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                       Enrollment Date
                     </th>
                     <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                       Actions
                     </th>
                  </tr>
                </thead>
                                 <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredStudents.map((student) => (
                                         <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-indigo-600">
                                {student.name.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                                                 <div className="text-sm font-medium text-gray-900 dark:text-white">
                       {student.name}
                     </div>
                     <div className="text-sm text-gray-500 dark:text-gray-300">
                       Roll: {student.rollNumber} • {student.gender}
                     </div>
                          </div>
                        </div>
                      </td>
                                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                         {student.class}
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                         {student.contactNumber || 'N/A'}
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                         {student.enrollmentDate}
                       </td>
                                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {canPerformCRUD ? (
                            <div className="flex space-x-2 justify-end">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEditModal(student)}
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteStudent(student.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                Delete
                              </Button>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-500 dark:text-gray-400">Read-only</span>
                          )}
                        </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Add Class Modal */}
      {showAddClassModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
                         <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Add New Class</h3>
            <div className="space-y-4">
              <div>
                                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Class Name</label>
                <input
                  type="text"
                  value={classForm.name}
                  onChange={(e) => setClassForm(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., Class 8 - A"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Standard</label>
                  <input
                    type="text"
                    value={classForm.standard}
                    onChange={(e) => setClassForm(prev => ({ ...prev, standard: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., 8"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Section</label>
                  <input
                    type="text"
                    value={classForm.section}
                    onChange={(e) => setClassForm(prev => ({ ...prev, section: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., A"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Tip: You can either type a full class name above or specify Standard and Section to auto-generate the name.</p>
              <div className="flex space-x-3">
                <Button
                  onClick={handleAddClass}
                  className="flex-1"
                >
                  Add Class
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAddClassModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {showAddStudentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                         <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Add New Student</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name *</label>
                <input
                  type="text"
                  value={studentForm.name}
                  onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Student's full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Roll Number *</label>
                <input
                  type="text"
                  value={studentForm.rollNumber}
                  onChange={(e) => setStudentForm({ ...studentForm, rollNumber: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., 001, 2024001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Gender *</label>
                <select
                  value={studentForm.gender}
                  onChange={(e) => setStudentForm({ ...studentForm, gender: e.target.value as 'male' | 'female' | 'other' })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Class *</label>
                <select
                  value={studentForm.class}
                  onChange={(e) => setStudentForm({ ...studentForm, class: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Class</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.name}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Age</label>
                <input
                  type="number"
                  value={studentForm.age}
                  onChange={(e) => setStudentForm({ ...studentForm, age: parseInt(e.target.value) || 0 })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Age in years"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                <input
                  type="tel"
                  value={studentForm.contactNumber}
                  onChange={(e) => setStudentForm({ ...studentForm, contactNumber: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="+91-XXXXXXXXXX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Parent Name</label>
                <input
                  type="text"
                  value={studentForm.parentName}
                  onChange={(e) => setStudentForm({ ...studentForm, parentName: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Parent/Guardian name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Parent Contact</label>
                <input
                  type="tel"
                  value={studentForm.parentContact}
                  onChange={(e) => setStudentForm({ ...studentForm, parentContact: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="+91-XXXXXXXXXX"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <textarea
                  value={studentForm.address}
                  onChange={(e) => setStudentForm({ ...studentForm, address: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Student's address"
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <Button
                onClick={handleAddStudent}
                className="flex-1"
              >
                Add Student
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAddStudentModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {showEditStudentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Edit Student</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name *</label>
                <input
                  type="text"
                  value={studentForm.name}
                  onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Student's full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Roll Number *</label>
                <input
                  type="text"
                  value={studentForm.rollNumber}
                  onChange={(e) => setStudentForm({ ...studentForm, rollNumber: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., 001, 2024001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Gender *</label>
                <select
                  value={studentForm.gender}
                  onChange={(e) => setStudentForm({ ...studentForm, gender: e.target.value as 'male' | 'female' | 'other' })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Class *</label>
                <select
                  value={studentForm.class}
                  onChange={(e) => setStudentForm({ ...studentForm, class: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Class</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.name}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Age</label>
                <input
                  type="number"
                  value={studentForm.age}
                  onChange={(e) => setStudentForm({ ...studentForm, age: parseInt(e.target.value) || 0 })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Age in years"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                <input
                  type="tel"
                  value={studentForm.contactNumber}
                  onChange={(e) => setStudentForm({ ...studentForm, contactNumber: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="+91-XXXXXXXXXX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Parent Name</label>
                <input
                  type="text"
                  value={studentForm.parentName}
                  onChange={(e) => setStudentForm({ ...studentForm, parentName: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Parent/Guardian name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Parent Contact</label>
                <input
                  type="tel"
                  value={studentForm.parentContact}
                  onChange={(e) => setStudentForm({ ...studentForm, parentContact: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="+91-XXXXXXXXXX"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <textarea
                  value={studentForm.address}
                  onChange={(e) => setStudentForm({ ...studentForm, address: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Student's address"
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <Button
                onClick={handleEditStudent}
                className="flex-1"
              >
                Update Student
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowEditStudentModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StudentManagementPage
