export const dynamic = 'force-dynamic'

import { SearchBar } from '@/components/search/SearchBar'
import { ToolGrid } from '@/components/tools/ToolGrid'
import { getTrendingTools, getTools } from '@/lib/queries/tools'
import { getCategories } from '@/lib/queries/categories'
import Link from 'next/link'
import { getCategoryIcon } from '@/lib/utils'

export default async function HomePage() {
  const [trending, recent, categories] = await Promise.all([
    getTrendingTools(6),
    getTools({ sort: 'recent' }, 1, 6),
    getCategories(),
  ])

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🎯 Skill of Skills
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Curated directory of Claude Code skills, plugins, and MCP servers
        </p>
        <div className="max-w-2xl mx-auto">
          <SearchBar />
        </div>
      </div>

      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">🔥 Trending</h2>
          <Link href="/tools?sort=trending" className="text-primary-600 hover:text-primary-700">
            View all →
          </Link>
        </div>
        <ToolGrid tools={trending} />
      </section>

      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">🆕 Recently Added</h2>
          <Link href="/tools?sort=recent" className="text-primary-600 hover:text-primary-700">
            View all →
          </Link>
        </div>
        <ToolGrid tools={recent.data} />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6">📂 Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="p-4 rounded-lg border border-gray-200 hover:border-primary-500 hover:shadow-sm transition-all text-center"
            >
              <span className="text-2xl">{getCategoryIcon(cat.slug)}</span>
              <p className="font-medium mt-2">{cat.name}</p>
              <p className="text-sm text-gray-500">{cat._count?.tools || 0} tools</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
