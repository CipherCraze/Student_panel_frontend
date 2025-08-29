import React, { useState, useEffect } from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

interface CreateModalProps {
  collectionName: string
  isOpen: boolean
  onClose: () => void
  onCreate: (data: any) => void
}

export const CreateModal: React.FC<CreateModalProps> = ({ collectionName, isOpen, onClose, onCreate }) => {
  const [formData, setFormData] = useState<any>({})
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await onCreate(formData)
      setFormData({})
      onClose()
    } catch (error) {
      console.error('Create failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  // Common fields for different collections
  const getDefaultFields = () => {
    const baseFields = {
      name: '',
      title: '',
      description: '',
      isActive: true,
      isDeleted: false
    }

    switch (collectionName) {
      case 'schools':
        return {
          ...baseFields,
          schoolName: '',
          board: '',
          phone: '',
          address: '',
          website: '',
          totalStudents: 0
        }
      case 'classes':
        return {
          ...baseFields,
          className: '',
          standard: '',
          section: '',
          capacity: 30
        }
      case 'students':
        return {
          ...baseFields,
          fullName: '',
          rollNumber: '',
          gender: 'Male',
          age: 0,
          contactNumber: '',
          parentName: '',
          parentContact: '',
          address: ''
        }
      case 'lessons':
        return {
          ...baseFields,
          lessonName: '',
          lessonBannerImage: '',
          text: {},
          topicId: '',
          order: 1,
          chapterId: ''
        }
      default:
        return baseFields
    }
  }

  useEffect(() => {
    setFormData(getDefaultFields())
  }, [collectionName])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Create New {collectionName.slice(0, -1)}
          </h2>
          <Button
            onClick={onClose}
            variant="outline"
            size="sm"
          >
            Close
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-4">
            {Object.entries(formData).map(([key, value]) => {
              if (key === '_id' || key === '__v' || key === 'createdAt' || key === 'updatedAt') return null
              
              return (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </label>
                  {typeof value === 'boolean' ? (
                    <select
                      value={String(value)}
                      onChange={(e) => setFormData({ ...formData, [key]: e.target.value === 'true' })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="true">True</option>
                      <option value="false">False</option>
                    </select>
                  ) : typeof value === 'number' ? (
                    <Input
                      type="number"
                      value={value}
                      onChange={(e) => setFormData({ ...formData, [key]: Number(e.target.value) })}
                    />
                  ) : key === 'text' ? (
                    <textarea
                      value={JSON.stringify(value, null, 2)}
                      onChange={(e) => {
                        try {
                          const parsed = JSON.parse(e.target.value)
                          setFormData({ ...formData, [key]: parsed })
                        } catch {
                          setFormData({ ...formData, [key]: e.target.value })
                        }
                      }}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter JSON object"
                    />
                  ) : (
                    <Input
                      value={String(value)}
                      onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                    />
                  )}
                </div>
              )
            })}
          </div>
          
          <div className="flex justify-end gap-2 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              size="sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              size="sm"
            >
              {isLoading ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
