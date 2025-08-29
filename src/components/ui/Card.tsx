import React from 'react'
import { cn } from '../../lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  hover?: boolean
  glass?: boolean
}

export function Card({ children, className, hover = false, glass = false, ...props }: CardProps) {
  return (
    <div 
      className={cn(
        'relative rounded-2xl sm:rounded-3xl border border-secondary-200/50 bg-white shadow-soft',
        'dark:border-0 dark:ring-1 dark:ring-white/10 dark:bg-black/30 backdrop-blur-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),_0_18px_40px_rgba(0,0,0,0.45)]',
        glass && 'glass-effect',
        hover && 'card-hover cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps {
  children: React.ReactNode
  className?: string
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={cn('p-4 sm:p-6 pb-0', className)}>
      {children}
    </div>
  )
}

interface CardTitleProps {
  children: React.ReactNode
  className?: string
  gradient?: boolean
}

export function CardTitle({ children, className, gradient = false }: CardTitleProps) {
  return (
    <h3 className={cn(
      'text-lg sm:text-xl font-bold text-secondary-900 dark:text-white drop-shadow-[0_1px_0_rgba(0,0,0,0.4)]',
      gradient && 'gradient-text',
      className
    )}>
      {children}
    </h3>
  )
}

interface CardContentProps {
  children: React.ReactNode
  className?: string
}

export function CardContent({ children, className }: CardContentProps) {
  return (
    <div className={cn('text-secondary-700 dark:text-secondary-200 p-4 sm:p-6 pt-0', className)}>
      {children}
    </div>
  )
}
