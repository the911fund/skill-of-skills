import { Badge } from '@/components/ui/Badge'
import { MaintenanceStatus } from '@/utils/maintenanceStatus'

interface MaintenanceBadgeProps {
  status: MaintenanceStatus
}

export function MaintenanceBadge({ status }: MaintenanceBadgeProps) {
  // Map maintenance status to badge variants
  const variants: Record<MaintenanceStatus, 'success' | 'warning' | 'danger' | 'default'> = {
    Active: 'success',
    Maintained: 'warning',
    Stale: 'warning',
    Inactive: 'danger',
    Unknown: 'default',
  }

  // Icons for visual indication
  const icons: Record<MaintenanceStatus, string> = {
    Active: '🟢',
    Maintained: '🟡',
    Stale: '🟠',
    Inactive: '🔴',
    Unknown: '⚪',
  }

  return (
    <Badge variant={variants[status]}>
      <span role="img" aria-label={`${status} maintenance status`}>
        {icons[status]}
      </span>{' '}
      {status}
    </Badge>
  )
}
