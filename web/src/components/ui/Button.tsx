import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  asChild?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', asChild, children, ...props }, ref) => {
    const classes = cn(
      'inline-flex items-center justify-center rounded-md font-medium transition-colors',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
      'disabled:pointer-events-none disabled:opacity-50',
      {
        'bg-primary-600 text-white hover:bg-primary-700': variant === 'primary',
        'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600': variant === 'secondary',
        'border border-gray-300 bg-white hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700': variant === 'outline',
        'h-8 px-3 text-sm': size === 'sm',
        'h-10 px-4 text-sm': size === 'md',
        'h-12 px-6 text-base': size === 'lg',
      },
      className
    )

    if (asChild && children) {
      // For asChild, we expect children to be a single element that we can clone
      return <span className={classes}>{children}</span>
    }

    return (
      <button
        ref={ref}
        className={classes}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
