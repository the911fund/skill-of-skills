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

        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">{tool.name}</h3>

        {tool.repoOwner && (
          <p className="text-xs text-gray-400 dark:text-gray-400 mb-2">
            by <span className="font-medium text-gray-500 dark:text-gray-300">{tool.repoOwner}</span>
          </p>
        )}

        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
          {tool.description || 'No description available'}
        </p>

        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <span>⭐ {formatNumber(tool.stars)}</span>
            {tool.category && (
              <span>
                {getCategoryIcon(tool.category.slug)} {tool.category.name}
              </span>
            )}
          </div>
          {tool.repoOwner && tool.repoName && (
            <span className="text-xs text-gray-400 dark:text-gray-400">{tool.repoOwner}/{tool.repoName}</span>
          )}
        </div>
      </Card>
    </Link>
  )
}
