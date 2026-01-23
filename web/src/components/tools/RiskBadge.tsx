import { Badge } from '@/components/ui/Badge'

interface RiskBadgeProps {
  level: string
}

export function RiskBadge({ level }: RiskBadgeProps) {
  const variants: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
    low: 'success',
    medium: 'warning',
    high: 'danger',
    critical: 'danger',
  }

  const icons: Record<string, string> = {
    low: '🟢',
    medium: '🟡',
    high: '🔴',
    critical: '⚫',
  }

  return (
    <Badge variant={variants[level] || 'default'}>
      {icons[level]} {level}
    </Badge>
  )
}
