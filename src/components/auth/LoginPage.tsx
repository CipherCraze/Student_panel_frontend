import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { EnvelopeIcon, LockClosedIcon, SparklesIcon } from '@heroicons/react/24/outline'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { user, login, isLoading } = useAuth()

  if (user) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    try {
      await login(email, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid email or password')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-60 sm:w-80 h-60 sm:h-80 bg-primary-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-60 sm:w-80 h-60 sm:h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 left-40 w-60 sm:w-80 h-60 sm:h-80 bg-secondary-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      </div>
      
      <div className="max-w-md w-full space-y-6 sm:space-y-8 relative z-10">
        <div className="text-center animate-fade-in">
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-primary-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-large">
              <SparklesIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold gradient-text mb-2">
            SpeakGenie
          </h2>
          <h3 className="text-lg sm:text-xl font-semibold text-secondary-800 mb-2">
            Admin Panel
          </h3>
          <p className="text-secondary-600">
            Sign in to manage schools and students
          </p>
        </div>
        
        <Card className="animate-slide-up" glass>
          <CardHeader>
            <CardTitle className="text-center text-2xl" gradient>Welcome Back</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@speakgenie.com"
                icon={<EnvelopeIcon className="w-5 h-5" />}
                required
              />
              
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                icon={<LockClosedIcon className="w-5 h-5" />}
                required
              />
              
              {error && (
                <div className="text-sm text-error-600 bg-error-50 p-4 rounded-xl border border-error-200 animate-slide-up">
                  {error}
                </div>
              )}
              
              <Button
                type="submit"
                variant="gradient"
                size="lg"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
            
            <div className="mt-8 p-4 bg-secondary-50/80 rounded-xl border border-secondary-200">
              <p className="text-sm font-semibold text-secondary-700 mb-3">Demo Credentials:</p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-secondary-600">Super Admin:</span>
                  <span className="font-mono text-secondary-800">super@admin.com</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-600">School Admin:</span>
                  <span className="font-mono text-secondary-800">school@admin.com</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-600">Password:</span>
                  <span className="font-mono text-secondary-800">password</span>
                </div>
              </div>
              <div className="mt-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-700">
                  <strong>super@admin.com</strong> → Full Admin Panel with all schools<br />
                  <strong>school@admin.com</strong> → School-specific dashboard
                </p>
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-sm text-secondary-600">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  className="font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                >
                  Create Account
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
