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

  // Tooltip text explaining each status
  const tooltips: Record<MaintenanceStatus, string> = {
    Active: 'Active: Updated within the last 30 days',
    Maintained: 'Maintained: Updated within the last 90 days (30-90 days ago)',
    Stale: 'Stale: Updated within the last 180 days (90-180 days ago)',
    Inactive: 'Inactive: Not updated for over 180 days',
    Unknown: 'Unknown: No commit date available',
  }

  return (
    <span title={tooltips[status]}>
      <Badge variant={variants[status]}>
        <span role="img" aria-label={`${status} maintenance status`}>
          {icons[status]}
        </span>{' '}
        {status}
      </Badge>
    </span>
  )
}
