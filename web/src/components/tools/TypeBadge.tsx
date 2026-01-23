import { Badge } from '@/components/ui/Badge'
import { getToolTypeIcon } from '@/lib/utils'

interface TypeBadgeProps {
  type: string
}

export function TypeBadge({ type }: TypeBadgeProps) {
  const icon = getToolTypeIcon(type)
  const label = type.replace('_', ' ')

  return (
    <Badge>
      {icon} {label}
    </Badge>
  )
}
