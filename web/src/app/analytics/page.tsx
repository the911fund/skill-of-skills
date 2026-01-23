export const dynamic = 'force-dynamic'

import { StatsCard } from '@/components/analytics/StatsCard'
import { TypeDistribution } from '@/components/analytics/TypeDistribution'
import { TrendChart } from '@/components/analytics/TrendChart'
import { getStats } from '@/lib/queries/stats'
import { formatNumber } from '@/lib/utils'

export default async function AnalyticsPage() {
  const stats = await getStats()

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8">Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard title="Total Tools" value={stats.totalTools} icon="🎯" />
        <StatsCard title="Categories" value={stats.totalCategories} icon="📂" />
        <StatsCard title="Total Stars" value={formatNumber(stats.totalStars)} icon="⭐" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <TypeDistribution data={stats.toolsByType} />
        <TrendChart tools={stats.recentlyAdded} />
      </div>
    </div>
  )
}
