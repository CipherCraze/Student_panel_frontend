import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../ui/Button'

interface OnboardingData {
  schoolName: string
  board: string
  adminName: string
  adminEmail: string
  adminPhone: string
  adminPosition: string
  schoolAddress: {
    street: string
    city: string
    state: string
    country: string
    postalCode: string
  }
  website: string
  description: string
}

const OnboardingPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { completeOnboarding } = useAuth()

  const [formData, setFormData] = useState<OnboardingData>({
    schoolName: '',
    board: 'CBSE',
    adminName: '',
    adminEmail: '',
    adminPhone: '',
    adminPosition: '',
    schoolAddress: {
      street: '',
      city: '',
      state: '',
      country: 'India',
      postalCode: ''
    },
    website: '',
    description: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof OnboardingData],
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    try {
      await completeOnboarding(formData)
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete onboarding')
    } finally {
      setLoading(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">School Information</h3>
              <p className="text-sm text-gray-600">Let's start with your school details</p>
            </div>
            
            <div>
              <label htmlFor="schoolName" className="block text-sm font-medium text-gray-700">
                School Name *
              </label>
              <input
                type="text"
                id="schoolName"
                name="schoolName"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={formData.schoolName}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="board" className="block text-sm font-medium text-gray-700">
                Education Board *
              </label>
              <select
                id="board"
                name="board"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={formData.board}
                onChange={handleChange}
              >
                <option value="CBSE">CBSE</option>
                <option value="ICSE">ICSE</option>
                <option value="State Board">State Board</option>
                <option value="IB">IB</option>
                <option value="Cambridge">Cambridge</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                School Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief description of your school..."
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Administrator Details</h3>
              <p className="text-sm text-gray-600">Your contact information</p>
            </div>
            
            <div>
              <label htmlFor="adminName" className="block text-sm font-medium text-gray-700">
                Your Full Name *
              </label>
              <input
                type="text"
                id="adminName"
                name="adminName"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={formData.adminName}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="adminPosition" className="block text-sm font-medium text-gray-700">
                Your Position *
              </label>
              <input
                type="text"
                id="adminPosition"
                name="adminPosition"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={formData.adminPosition}
                onChange={handleChange}
                placeholder="e.g., Principal, Administrator, Director"
              />
            </div>

            <div>
              <label htmlFor="adminEmail" className="block text-sm font-medium text-gray-700">
                Email Address *
              </label>
              <input
                type="email"
                id="adminEmail"
                name="adminEmail"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={formData.adminEmail}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="adminPhone" className="block text-sm font-medium text-gray-700">
                Phone Number *
              </label>
              <input
                type="tel"
                id="adminPhone"
                name="adminPhone"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={formData.adminPhone}
                onChange={handleChange}
                placeholder="+91XXXXXXXXXX"
              />
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">School Address</h3>
              <p className="text-sm text-gray-600">Where is your school located?</p>
            </div>
            
            <div>
              <label htmlFor="schoolAddress.street" className="block text-sm font-medium text-gray-700">
                Street Address *
              </label>
              <input
                type="text"
                id="schoolAddress.street"
                name="schoolAddress.street"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={formData.schoolAddress.street}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="schoolAddress.city" className="block text-sm font-medium text-gray-700">
                  City *
                </label>
                <input
                  type="text"
                  id="schoolAddress.city"
                  name="schoolAddress.city"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.schoolAddress.city}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="schoolAddress.state" className="block text-sm font-medium text-gray-700">
                  State *
                </label>
                <input
                  type="text"
                  id="schoolAddress.state"
                  name="schoolAddress.state"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.schoolAddress.state}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="schoolAddress.country" className="block text-sm font-medium text-gray-700">
                  Country *
                </label>
                <input
                  type="text"
                  id="schoolAddress.country"
                  name="schoolAddress.country"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.schoolAddress.country}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="schoolAddress.postalCode" className="block text-sm font-medium text-gray-700">
                  Postal Code *
                </label>
                <input
                  type="text"
                  id="schoolAddress.postalCode"
                  name="schoolAddress.postalCode"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.schoolAddress.postalCode}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Additional Information</h3>
              <p className="text-sm text-gray-600">Optional details about your school</p>
            </div>
            
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                School Website
              </label>
              <input
                type="url"
                id="website"
                name="website"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://www.yourschool.com"
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-md">
              <h4 className="text-sm font-medium text-blue-900">Ready to complete setup?</h4>
              <p className="text-sm text-blue-700 mt-1">
                Your school will be created and you'll be redirected to your dashboard where you can start managing students and classes.
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow p-8">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Step {currentStep} of 4
              </span>
              <span className="text-sm text-gray-500">
                {Math.round((currentStep / 4) * 100)}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 4) * 100}%` }}
              />
            </div>
          </div>

          {/* Step Content */}
          {renderStep()}

          {/* Error Message */}
          {error && (
            <div className="mt-4 text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between">
            <Button
              onClick={prevStep}
              disabled={currentStep === 1}
              variant="outline"
              className="px-6"
            >
              Previous
            </Button>

            {currentStep < 4 ? (
              <Button
                onClick={nextStep}
                className="px-6"
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6"
              >
                {loading ? 'Setting up...' : 'Complete Setup'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default OnboardingPage
