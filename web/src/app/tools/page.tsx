export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { ToolGrid } from '@/components/tools/ToolGrid'
import { SearchFilters } from '@/components/search/SearchFilters'
import { Pagination } from '@/components/ui/Pagination'
import { getTools } from '@/lib/queries/tools'

interface Props {
  searchParams: { type?: string; sort?: string; page?: string }
}

export default async function ToolsPage({ searchParams }: Props) {
  const page = parseInt(searchParams.page || '1')
  const result = await getTools(
    { type: searchParams.type, sort: searchParams.sort as any },
    page,
    18
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Browse Tools</h1>
        <Suspense fallback={null}>
          <SearchFilters />
        </Suspense>
      </div>

      <ToolGrid tools={result.data} />

      {result.totalPages > 1 && (
        <div className="mt-8">
          <Suspense fallback={null}>
            <Pagination
              page={result.page}
              totalPages={result.totalPages}
            />
          </Suspense>
        </div>
      )}
    </div>
  )
}
