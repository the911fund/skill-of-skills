import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { RiskBadge } from './RiskBadge'
import { TypeBadge } from './TypeBadge'
import { formatNumber, getCategoryIcon } from '@/lib/utils'
import type { Tool } from '@/types'

interface ToolCardProps {
  tool: Tool
}

export function ToolCard({ tool }: ToolCardProps) {
  return (
    <Link href={`/tools/${tool.slug}`}>
      <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <TypeBadge type={tool.toolType} />
            {tool.isOfficial && <Badge variant="success">Official</Badge>}
            {tool.isVerified && <Badge variant="default">Verified</Badge>}
          </div>
          <RiskBadge level={tool.riskLevel} />
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2">{tool.name}</h3>

        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {tool.description || 'No description available'}
        </p>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-3">
            <span>⭐ {formatNumber(tool.stars)}</span>
            {tool.category && (
              <span>
                {getCategoryIcon(tool.category.slug)} {tool.category.name}
              </span>
            )}
          </div>
          <span className="text-xs">Score: {tool.compositeScore.toFixed(1)}</span>
        </div>
      </Card>
    </Link>
  )
}
