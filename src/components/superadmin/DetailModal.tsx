import React, { useState, useEffect } from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

interface CollectionItem {
  _id: string
  [key: string]: any
}

interface DetailModalProps {
  item: CollectionItem | null
  collectionName: string
  isOpen: boolean
  onClose: () => void
  onUpdate: (item: any) => void
  onDelete: () => void
}

export const DetailModal: React.FC<DetailModalProps> = ({ item, collectionName, isOpen, onClose, onUpdate, onDelete }) => {
  const [editMode, setEditMode] = useState(false)
  const [editData, setEditData] = useState<any>({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (item) {
      setEditData({ ...item })
      setEditMode(false)
    }
  }, [item])

  const handleSave = async () => {
    if (!item) return
    setIsLoading(true)
    try {
      await onUpdate(editData)
      setEditMode(false)
    } catch (error) {
      console.error('Update failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!item || !confirm(`Are you sure you want to delete this ${collectionName.slice(0, -1)}?`)) return
    setIsLoading(true)
    try {
      await onDelete()
      onClose()
    } catch (error) {
      console.error('Delete failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen || !item) return null

  const formatValue = (key: string, value: any): string => {
    if (value === null || value === undefined) return '-'
    if (typeof value === 'object') return JSON.stringify(value, null, 2)
    if (key === 'createdAt' || key === 'updatedAt') {
      return new Date(value).toLocaleString()
    }
    return String(value)
  }

  const isEditableField = (key: string): boolean => {
    return !['_id', '__v', 'createdAt', 'updatedAt'].includes(key)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {editMode ? 'Edit' : 'View'} {collectionName.slice(0, -1)} Details
          </h2>
          <div className="flex gap-2">
            {!editMode && (
              <Button
                onClick={() => setEditMode(true)}
                variant="outline"
                size="sm"
              >
                Edit
              </Button>
            )}
            {editMode && (
              <>
                <Button
                  onClick={handleSave}
                  disabled={isLoading}
                  size="sm"
                >
                  {isLoading ? 'Saving...' : 'Save'}
                </Button>
                <Button
                  onClick={() => setEditMode(false)}
                  variant="outline"
                  size="sm"
                >
                  Cancel
                </Button>
              </>
            )}
            <Button
              onClick={onClose}
              variant="outline"
              size="sm"
            >
              Close
            </Button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {editMode ? (
            <div className="space-y-4">
              {Object.entries(editData).map(([key, value]) => {
                if (!isEditableField(key)) return null
                
                return (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </label>
                    {typeof value === 'boolean' ? (
                      <select
                        value={String(value)}
                        onChange={(e) => setEditData({ ...editData, [key]: e.target.value === 'true' })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="true">True</option>
                        <option value="false">False</option>
                      </select>
                    ) : typeof value === 'number' ? (
                      <Input
                        type="number"
                        value={value}
                        onChange={(e) => setEditData({ ...editData, [key]: Number(e.target.value) })}
                      />
                    ) : (
                      <Input
                        value={String(value)}
                        onChange={(e) => setEditData({ ...editData, [key]: e.target.value })}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(item).map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </dt>
                  <dd className="text-sm text-gray-900 dark:text-white break-words">
                    {formatValue(key, value)}
                  </dd>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {!editMode && (
          <div className="flex justify-end gap-2 p-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              onClick={handleDelete}
              variant="outline"
              size="sm"
              disabled={isLoading}
              className="text-red-600 border-red-600 hover:bg-red-50 dark:text-red-400 dark:border-red-400 dark:hover:bg-red-900/20"
            >
              {isLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
