import { Card } from '@/components/ui/Card'
import type { Tool } from '@/types'

interface TrendChartProps {
  tools: Tool[]
}

export function TrendChart({ tools }: TrendChartProps) {
  return (
    <Card>
      <h2 className="text-lg font-semibold dark:text-gray-100 mb-4">Recently Added</h2>
      <div className="space-y-3">
        {tools.map((tool) => (
          <div key={tool.id} className="flex items-center justify-between py-2 border-b last:border-0 dark:border-gray-700">
            <div>
              <p className="font-medium dark:text-gray-100">{tool.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{tool.category?.name || 'Uncategorized'}</p>
            </div>
            <p className="text-sm text-gray-400 dark:text-gray-400">
              {new Date(tool.discoveredAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </Card>
  )
}
