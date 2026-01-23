import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { RiskBadge } from './RiskBadge'
import { TypeBadge } from './TypeBadge'
import { InstallCommand } from './InstallCommand'
import { RatingStars } from '@/components/engagement/RatingStars'
import { FavoriteButton } from '@/components/engagement/FavoriteButton'
import { formatNumber, getCategoryIcon } from '@/lib/utils'
import type { Tool } from '@/types'

interface ToolDetailProps {
  tool: Tool
}

export function ToolDetail({ tool }: ToolDetailProps) {
  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TypeBadge type={tool.toolType} />
              {tool.isOfficial && <Badge variant="success">Official</Badge>}
              {tool.isVerified && <Badge variant="default">Verified</Badge>}
              <RiskBadge level={tool.riskLevel} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{tool.name}</h1>
          </div>
          <FavoriteButton toolId={tool.id} />
        </div>

        <p className="text-gray-600 mb-6">{tool.description || 'No description available'}</p>

        <InstallCommand command={tool.installCommand} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
          <div>
            <p className="text-sm text-gray-500">Stars</p>
            <p className="text-xl font-semibold">⭐ {formatNumber(tool.stars)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Category</p>
            <p className="text-xl font-semibold">
              {tool.category ? `${getCategoryIcon(tool.category.slug)} ${tool.category.name}` : 'Uncategorized'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Score</p>
            <p className="text-xl font-semibold">{tool.compositeScore.toFixed(1)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Rating</p>
            <RatingStars toolId={tool.id} initialRating={tool.averageRating || 0} count={tool.ratingCount || 0} />
          </div>
        </div>

        {tool.repoUrl && (
          <div className="mt-6 pt-6 border-t">
            <a href={tool.repoUrl} target="_blank" rel="noopener noreferrer">
              <Button>
                View on GitHub →
              </Button>
            </a>
          </div>
        )}
      </Card>

      {tool.riskReasons && tool.riskReasons.length > 0 && (
        <Card>
          <h2 className="text-lg font-semibold mb-3">Risk Assessment</h2>
          <ul className="space-y-2">
            {tool.riskReasons.map((reason, i) => (
              <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                <span>⚠️</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}
