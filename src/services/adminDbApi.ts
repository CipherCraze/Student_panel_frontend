import { isUsingMockApi } from './apiFactory'

// API Configuration - respect mock API settings
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Mock data for admin DB operations
const mockCollections = ['users', 'schools', 'students', 'analytics', 'settings']
const mockSchoolData = [
  { _id: '1', name: 'Greenwood Elementary', students: 245, status: 'active' },
  { _id: '2', name: 'Riverside High School', students: 456, status: 'active' },
]
const mockUserData = [
  { _id: '1', email: 'superadmin@speakgenie.com', role: 'super_admin', name: 'Super Admin' },
  { _id: '2', email: 'school@admin.com', role: 'school_admin', name: 'School Admin' },
]

// Request helper with authentication
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('token')
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Network error')
  }
}

export const adminDbApi = {
  async getCollections(): Promise<string[]> {
    if (isUsingMockApi()) {
      return Promise.resolve(mockCollections)
    }
    const response = await apiRequest<{ collections: string[] }>('/admin/db/collections')
    return response.collections
  },

  async getCollectionData(collection: string, params: any = {}): Promise<any> {
    if (isUsingMockApi()) {
      // Return mock data based on collection
      const mockData = {
        schools: mockSchoolData,
        users: mockUserData,
        students: [],
        analytics: [],
        settings: []
      }
      
      const data = mockData[collection as keyof typeof mockData] || []
      const page = parseInt(params.page) || 1
      const limit = parseInt(params.limit) || 20
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      
      return Promise.resolve({
        docs: data.slice(startIndex, endIndex),
        total: data.length,
        page,
        pages: Math.ceil(data.length / limit)
      })
    }
    
    const queryString = new URLSearchParams(params).toString()
    const url = queryString ? `/admin/db/${collection}?${queryString}` : `/admin/db/${collection}`
    const response = await apiRequest(url)
    return response
  },

  async getCollectionItem(collection: string, id: string): Promise<any> {
    if (isUsingMockApi()) {
      const mockData = {
        schools: mockSchoolData,
        users: mockUserData
      }
      const data = mockData[collection as keyof typeof mockData] || []
      const item = data.find((item: any) => item._id === id)
      return Promise.resolve(item || null)
    }
    
    const response = await apiRequest(`/admin/db/${collection}/${id}`)
    return response
  },

  async createCollectionItem(collection: string, data: any): Promise<any> {
    if (isUsingMockApi()) {
      const newItem = { ...data, _id: Date.now().toString() }
      return Promise.resolve(newItem)
    }
    
    const response = await apiRequest(`/admin/db/${collection}`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
    return response
  },

  async updateCollectionItem(collection: string, id: string, data: any): Promise<any> {
    if (isUsingMockApi()) {
      const updatedItem = { ...data, _id: id }
      return Promise.resolve(updatedItem)
    }
    
    const response = await apiRequest(`/admin/db/${collection}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
    return response
  },

  async deleteCollectionItem(collection: string, id: string): Promise<void> {
    if (isUsingMockApi()) {
      return Promise.resolve()
    }
    
    await apiRequest(`/admin/db/${collection}/${id}`, {
      method: 'DELETE'
    })
  }
}

