import { Card } from '@/components/ui/Card'
import { getToolTypeIcon } from '@/lib/utils'

interface TypeDistributionProps {
  data: { type: string; count: number }[]
}

export function TypeDistribution({ data }: TypeDistributionProps) {
  const total = data.reduce((sum, d) => sum + d.count, 0)

  return (
    <Card>
      <h2 className="text-lg font-semibold dark:text-gray-100 mb-4">Tools by Type</h2>
      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.type} className="flex items-center gap-3">
            <span className="text-xl">{getToolTypeIcon(item.type)}</span>
            <div className="flex-1">
              <div className="flex justify-between text-sm">
                <span className="capitalize dark:text-gray-200">{item.type.replace('_', ' ')}</span>
                <span className="text-gray-500 dark:text-gray-400">{item.count}</span>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full mt-1">
                <div
                  className="h-full bg-primary-500 rounded-full"
                  style={{ width: `${(item.count / total) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
