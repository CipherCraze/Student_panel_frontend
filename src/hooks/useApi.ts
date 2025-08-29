import { useState, useCallback } from 'react'
import { ApiError } from '../services/api'

interface ApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

interface UseApiReturn<T> extends ApiState<T> {
  execute: (...args: any[]) => Promise<T | null>
  reset: () => void
  setData: (data: T) => void
}

export function useApi<T>(
  apiFunction: (...args: any[]) => Promise<T>,
  initialData: T | null = null
): UseApiReturn<T> {
  const [state, setState] = useState<ApiState<T>>({
    data: initialData,
    loading: false,
    error: null,
  })

  const execute = useCallback(
    async (...args: any[]): Promise<T | null> => {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      try {
        const result = await apiFunction(...args)
        setState({ data: result, loading: false, error: null })
        return result
      } catch (error) {
        const errorMessage = error instanceof ApiError 
          ? error.message 
          : error instanceof Error 
            ? error.message 
            : 'An unexpected error occurred'
        
        setState(prev => ({ ...prev, loading: false, error: errorMessage }))
        return null
      }
    },
    [apiFunction]
  )

  const reset = useCallback(() => {
    setState({ data: initialData, loading: false, error: null })
  }, [initialData])

  const setData = useCallback((data: T) => {
    setState(prev => ({ ...prev, data }))
  }, [])

  return {
    ...state,
    execute,
    reset,
    setData,
  }
}

// Hook for managing multiple API calls
export function useApiMultiple<T extends Record<string, any>>(
  apiFunctions: T
): {
  [K in keyof T]: UseApiReturn<Awaited<ReturnType<T[K]>>>
} {
  const result = {} as any

  for (const [key, apiFunction] of Object.entries(apiFunctions)) {
    result[key] = useApi(apiFunction as any)
  }

  return result
}

// Hook for optimistic updates
export function useOptimisticUpdate<T>(
  apiFunction: (data: T) => Promise<T>,
  onSuccess?: (data: T) => void,
  onError?: (error: string) => void
) {
  const [loading, setLoading] = useState(false)

  const execute = useCallback(
    async (data: T): Promise<T | null> => {
      setLoading(true)
      
      try {
        const result = await apiFunction(data)
        onSuccess?.(result)
        return result
      } catch (error) {
        const errorMessage = error instanceof ApiError 
          ? error.message 
          : error instanceof Error 
            ? error.message 
            : 'An unexpected error occurred'
        
        onError?.(errorMessage)
        return null
      } finally {
        setLoading(false)
      }
    },
    [apiFunction, onSuccess, onError]
  )

  return { execute, loading }
}

// Hook for pagination
export function usePaginatedApi<T>(
  apiFunction: (page: number, limit: number, ...args: any[]) => Promise<{
    data: T[]
    total: number
    page: number
    limit: number
    totalPages: number
  }>,
  initialPage: number = 1,
  initialLimit: number = 10
) {
  const [page, setPage] = useState(initialPage)
  const [limit, setLimit] = useState(initialLimit)
  const [data, setData] = useState<T[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(
    async (...args: any[]): Promise<void> => {
      setLoading(true)
      setError(null)
      
      try {
        const result = await apiFunction(page, limit, ...args)
        setData(result.data)
        setTotal(result.total)
        setTotalPages(result.totalPages)
      } catch (error) {
        const errorMessage = error instanceof ApiError 
          ? error.message 
          : error instanceof Error 
            ? error.message 
            : 'An unexpected error occurred'
        
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    },
    [apiFunction, page, limit]
  )

  const goToPage = useCallback((newPage: number) => {
    setPage(newPage)
  }, [])

  const changeLimit = useCallback((newLimit: number) => {
    setLimit(newLimit)
    setPage(1) // Reset to first page when changing limit
  }, [])

  const reset = useCallback(() => {
    setPage(initialPage)
    setLimit(initialLimit)
    setData([])
    setTotal(0)
    setTotalPages(0)
    setLoading(false)
    setError(null)
  }, [initialPage, initialLimit])

  return {
    data,
    total,
    page,
    limit,
    totalPages,
    loading,
    error,
    fetchData,
    goToPage,
    changeLimit,
    reset,
  }
}
