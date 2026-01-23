import { ToolGrid } from '@/components/tools/ToolGrid'
import type { Tool } from '@/types'

interface SearchResultsProps {
  tools: Tool[]
  query: string
}

export function SearchResults({ tools, query }: SearchResultsProps) {
  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">
        {tools.length} result{tools.length !== 1 ? 's' : ''} for "{query}"
      </p>
      <ToolGrid tools={tools} />
    </div>
  )
}
