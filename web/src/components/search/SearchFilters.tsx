'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Select } from '@/components/ui/Select'

const types = [
  { value: '', label: 'All Types' },
  { value: 'skill', label: 'Skills' },
  { value: 'plugin', label: 'Plugins' },
  { value: 'collection', label: 'Collections' },
  { value: 'cli_tool', label: 'CLI Tools' },
  { value: 'mcp_server', label: 'MCP Servers' },
]

const sorts = [
  { value: 'score', label: 'Best Match' },
  { value: 'stars', label: 'Most Stars' },
  { value: 'trending', label: 'Trending' },
  { value: 'recent', label: 'Recently Added' },
]

export function SearchFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex gap-4">
      <Select
        value={searchParams.get('type') || ''}
        onChange={(e) => updateFilter('type', e.target.value)}
      >
        {types.map((t) => (
          <option key={t.value} value={t.value}>{t.label}</option>
        ))}
      </Select>
      <Select
        value={searchParams.get('sort') || 'score'}
        onChange={(e) => updateFilter('sort', e.target.value)}
      >
        {sorts.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </Select>
    </div>
  )
}
