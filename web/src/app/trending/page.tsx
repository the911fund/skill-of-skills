export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { ToolGrid } from '@/components/tools/ToolGrid'
import { Pagination } from '@/components/ui/Pagination'
import { getTools } from '@/lib/queries/tools'

export const metadata: Metadata = {
  title: 'Trending Tools',
  description: 'Discover the most popular and trending Claude Code tools, skills, and plugins.',
}

interface Props {
  searchParams: { page?: string }
}

export default async function TrendingPage({ searchParams }: Props) {
  const page = parseInt(searchParams.page || '1')
  const result = await getTools(
    { sort: 'trending' },
    page,
    18
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold dark:text-gray-100">🔥 Trending Tools</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Tools ranked by GitHub activity, social mentions, and recent updates.
        </p>
      </div>

      <ToolGrid tools={result.data} />

      {result.totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            page={result.page}
            totalPages={result.totalPages}
          />
        </div>
      )}
    </div>
  )
}
