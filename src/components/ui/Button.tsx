import React from 'react'
import { cn } from '../../lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export function Button({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  children,
  ...props 
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 transform active:scale-95',
        {
          'bg-primary-600 text-white hover:bg-primary-700 shadow-lg hover:shadow-xl focus-visible:ring-primary-500 dark:shadow-vip': variant === 'primary',
          'bg-secondary-100 text-secondary-900 hover:bg-secondary-200 shadow-md hover:shadow-lg focus-visible:ring-secondary-500 dark:bg-black/30 dark:text-white dark:hover:bg-black/40 dark:shadow-vip': variant === 'secondary',
          'border-2 border-secondary-300 bg-white text-secondary-700 hover:bg-secondary-50 hover:border-secondary-400 shadow-md hover:shadow-lg focus-visible:ring-secondary-500 dark:border-white/10 dark:bg-black/20 dark:text-white dark:hover:bg-black/30 dark:shadow-vip': variant === 'outline',
          'text-secondary-700 hover:bg-secondary-100 hover:text-secondary-900 focus-visible:ring-secondary-500 dark:text-secondary-200 dark:hover:bg-white/5 dark:hover:text-white': variant === 'ghost',
          'bg-gradient-to-r from-primary-600 to-blue-600 text-white hover:from-primary-700 hover:to-blue-700 shadow-lg hover:shadow-xl focus-visible:ring-primary-500 dark:shadow-vip': variant === 'gradient',
          'h-8 px-3 text-sm rounded-lg': size === 'sm',
          'h-11 px-6 py-2 text-sm': size === 'md',
          'h-14 px-8 text-base rounded-2xl': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
