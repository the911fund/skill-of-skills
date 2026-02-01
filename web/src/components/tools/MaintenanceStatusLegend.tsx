import { MaintenanceStatus } from '@/utils/maintenanceStatus'

export function MaintenanceStatusLegend() {
  const statuses: Array<{
    status: MaintenanceStatus
    color: string
    icon: string
    description: string
    threshold: string
  }> = [
    {
      status: 'Active',
      color: '#22c55e',
      icon: '🟢',
      description: 'Updated recently',
      threshold: '< 30 days',
    },
    {
      status: 'Maintained',
      color: '#eab308',
      icon: '🟡',
      description: 'Regular updates',
      threshold: '30-90 days',
    },
    {
      status: 'Stale',
      color: '#f97316',
      icon: '🟠',
      description: 'Infrequent updates',
      threshold: '90-180 days',
    },
    {
      status: 'Inactive',
      color: '#ef4444',
      icon: '🔴',
      description: 'No recent updates',
      threshold: '> 180 days',
    },
    {
      status: 'Unknown',
      color: '#6b7280',
      icon: '⚪',
      description: 'No commit data',
      threshold: 'N/A',
    },
  ]

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">
        📊 Maintenance Status Guide
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
        {statuses.map(({ status, color, icon, description, threshold }) => (
          <div key={status} className="flex flex-col">
            <div className="flex items-center gap-1.5 mb-1">
              <span role="img" aria-label={`${status} status`}>
                {icon}
              </span>
              <span className="text-sm font-medium text-gray-900">{status}</span>
            </div>
            <p className="text-xs text-gray-600">{description}</p>
            <p className="text-xs text-gray-500 mt-0.5">{threshold}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
