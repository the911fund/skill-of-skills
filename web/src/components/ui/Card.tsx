import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={cn(
      'rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 p-6 shadow-sm dark:shadow-slate-700/20', 
      className
    )}>
      {children}
    </div>
  )
}
