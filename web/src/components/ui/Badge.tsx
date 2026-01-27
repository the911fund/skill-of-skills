import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger'
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        {
          'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300': variant === 'default',
          'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200': variant === 'success',
          'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200': variant === 'warning',
          'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200': variant === 'danger',
        },
        className
      )}
    >
      {children}
    </span>
  )
}
