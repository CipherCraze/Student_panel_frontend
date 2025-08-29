import React from 'react'
import { cn } from '../../lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

export function Input({ className, label, error, icon, ...props }: InputProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-semibold text-secondary-800 dark:text-secondary-200">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className="text-secondary-400">
              {icon}
            </div>
          </div>
        )}
        <input
          className={cn(
            'flex h-12 w-full rounded-xl border-2 border-secondary-200 dark:border-white/10 bg-white/80 dark:bg-black/30 backdrop-blur-sm px-4 py-3 text-sm transition-all duration-200 placeholder:text-secondary-400 dark:placeholder:text-secondary-400/70 text-secondary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:cursor-not-allowed disabled:opacity-50',
            icon && 'pl-10',
            error && 'border-error-500 focus:ring-error-500 focus:border-error-500',
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="text-sm text-error-600 font-medium animate-slide-up">{error}</p>
      )}
    </div>
  )
}
