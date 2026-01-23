export const dynamic = 'force-dynamic'

import { SearchBar } from '@/components/search/SearchBar'
import { SearchResults } from '@/components/search/SearchResults'
import { searchTools } from '@/lib/queries/search'

interface Props {
  searchParams: { q?: string }
}

export default async function SearchPage({ searchParams }: Props) {
  const query = searchParams.q || ''
  const tools = query ? await searchTools(query) : []

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-6">Search</h1>

      <div className="mb-8">
        <SearchBar initialQuery={query} />
      </div>

      {query ? (
        <SearchResults tools={tools} query={query} />
      ) : (
        <p className="text-gray-500 text-center py-12">
          Enter a search term to find skills, plugins, and MCP servers
        </p>
      )}
    </div>
  )
}
