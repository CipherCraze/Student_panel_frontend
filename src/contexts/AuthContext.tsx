import React, { createContext, useContext, useEffect, useState } from 'react'
import type { User } from '../types'
import { authApi, ApiError } from '../services/apiFactory'

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (userData: { name: string; email: string; password: string; role: string }) => Promise<void>
  completeOnboarding: (onboardingData: any) => Promise<void>
  logout: () => Promise<void>
  isLoading: boolean
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check for stored user session and token
    const token = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    
    // Clear obviously invalid tokens (e.g., mock tokens) when switching to real backend
    const looksLikeJwt = (t: string | null) => !!t && t.split('.').length === 3
    if (!looksLikeJwt(token)) {
      localStorage.removeItem('token')
    }

    if (token && storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        setUser(userData)
        
        // Verify token is still valid
        authApi.getCurrentUser().catch(() => {
          // Token is invalid, clear storage
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          setUser(null)
        })
      } catch (error) {
        // Invalid stored data, clear storage
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const { token, user: userData } = await authApi.login(email, password)
      
      // Store token and user data
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userData))
      
      setUser(userData)
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : error instanceof Error 
          ? error.message 
          : 'Login failed'
      
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: { name: string; email: string; password: string; role: string }) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const { token, user: newUser } = await authApi.register(userData)
      
      // Store token and user data
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(newUser))
      
      setUser(newUser)
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : error instanceof Error 
          ? error.message 
          : 'Registration failed'
      
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const completeOnboarding = async (onboardingData: any) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const { user: updatedUser } = await authApi.completeOnboarding(onboardingData)
      
      // Update stored user data
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setUser(updatedUser)
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : error instanceof Error 
          ? error.message 
          : 'Onboarding failed'
      
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } catch (error) {
      // Even if logout API fails, we should still clear local storage
      console.warn('Logout API call failed:', error)
    } finally {
      // Clear local storage
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setUser(null)
      setError(null)
    }
  }

  const value = {
    user,
    login,
    register,
    completeOnboarding,
    logout,
    isLoading,
    error
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
