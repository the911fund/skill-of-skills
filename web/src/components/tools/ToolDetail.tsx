import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { RiskBadge } from './RiskBadge'
import { TypeBadge } from './TypeBadge'
import { InstallCommand } from './InstallCommand'
import { RatingStars } from '@/components/engagement/RatingStars'
import { FavoriteButton } from '@/components/engagement/FavoriteButton'
import { formatNumber, formatDate, getCategoryIcon } from '@/lib/utils'
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
            {tool.repoOwner && (
              <p className="text-sm text-gray-500 mt-1">
                by <a href={`https://github.com/${tool.repoOwner}`} target="_blank" rel="noopener noreferrer" className="font-medium text-gray-700 hover:text-primary-600">{tool.repoOwner}</a>
                {tool.repoName && (
                  <span className="text-gray-400 ml-2">
                    ({tool.repoOwner}/{tool.repoName})
                  </span>
                )}
              </p>
            )}
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
            <p className="text-sm text-gray-500">License</p>
            <p className="text-xl font-semibold">{tool.license || 'Unknown'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Rating</p>
            <RatingStars toolId={tool.id} initialRating={tool.averageRating || 0} count={tool.ratingCount || 0} />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div>
            <p className="text-sm text-gray-500">Forks</p>
            <p className="text-lg font-semibold">{formatNumber(tool.forks)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Last Updated</p>
            <p className="text-lg font-semibold">{formatDate(tool.updatedAt)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Discovered</p>
            <p className="text-lg font-semibold">{formatDate(tool.discoveredAt)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Validation</p>
            <p className="text-lg font-semibold">
              {tool.validationStatus === 'passed' && <span className="text-green-600">Passed</span>}
              {tool.validationStatus === 'failed' && <span className="text-red-600">Failed</span>}
              {tool.validationStatus === 'skipped' && <span className="text-yellow-600">Skipped</span>}
              {tool.validationStatus === 'pending' && <span className="text-gray-600">Pending</span>}
            </p>
          </div>
        </div>

        {tool.repoUrl && (
          <div className="mt-6 pt-6 border-t flex items-center gap-4">
            <a href={tool.repoUrl} target="_blank" rel="noopener noreferrer">
              <Button>
                View on GitHub →
              </Button>
            </a>
            {tool.repoOwner && tool.repoName && (
              <span className="text-sm text-gray-500">
                github.com/{tool.repoOwner}/{tool.repoName}
              </span>
            )}
          </div>
        )}
      </Card>

      {/* Trust & Verification Info */}
      <Card>
        <h2 className="text-lg font-semibold mb-3">Trust & Verification</h2>
        <div className="space-y-3 text-sm">
          {tool.isOfficial && (
            <div className="flex items-start gap-2">
              <Badge variant="success" className="mt-0.5">Official</Badge>
              <p className="text-gray-600">This tool is published by <strong>Anthropic</strong> or an official partner.</p>
            </div>
          )}
          {tool.isVerified && (
            <div className="flex items-start gap-2">
              <Badge variant="default" className="mt-0.5">Verified</Badge>
              <p className="text-gray-600">This tool has passed our automated validation: sandbox execution test, security scan, and dependency audit.</p>
            </div>
          )}
          <div className="flex items-start gap-2">
            <RiskBadge level={tool.riskLevel} />
            <p className="text-gray-600">
              {tool.riskLevel === 'low' && 'Standard permissions only. Safe for general use.'}
              {tool.riskLevel === 'medium' && 'Requires extended permissions (shell access, subagents). Review before use.'}
              {tool.riskLevel === 'high' && 'Broad system access required. Carefully review permissions before installing.'}
              {tool.riskLevel === 'critical' && 'Manual security review required. Use with extreme caution.'}
            </p>
          </div>
          {!tool.isOfficial && !tool.isVerified && (
            <p className="text-yellow-700 bg-yellow-50 p-3 rounded-lg">
              ⚠️ <strong>Unverified tool.</strong> This tool has not been verified by Skill of Skills. Always review the source code before installing any tool from an unknown author.
            </p>
          )}
        </div>
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
