// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

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
    const response = await apiRequest<{ collections: string[] }>('/admin/db/collections')
    return response.collections
  },

  async getCollectionData(collection: string, params: any = {}): Promise<any> {
    const queryString = new URLSearchParams(params).toString()
    const url = queryString ? `/admin/db/${collection}?${queryString}` : `/admin/db/${collection}`
    const response = await apiRequest(url)
    return response
  },

  async getCollectionItem(collection: string, id: string): Promise<any> {
    const response = await apiRequest(`/admin/db/${collection}/${id}`)
    return response
  },

  async createCollectionItem(collection: string, data: any): Promise<any> {
    const response = await apiRequest(`/admin/db/${collection}`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
    return response
  },

  async updateCollectionItem(collection: string, id: string, data: any): Promise<any> {
    const response = await apiRequest(`/admin/db/${collection}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
    return response
  },

  async deleteCollectionItem(collection: string, id: string): Promise<void> {
    await apiRequest(`/admin/db/${collection}/${id}`, {
      method: 'DELETE'
    })
  }
}

