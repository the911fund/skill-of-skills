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

      {/* Trust & Safety Legend */}
      <section className="mb-12 p-6 bg-gray-50 rounded-xl border border-gray-200">
        <h2 className="text-lg font-bold mb-4">🛡️ Trust & Verification Guide</h2>
        <p className="text-sm text-gray-600 mb-4">
          Always review tool source code before installing. These badges help you assess trustworthiness:
        </p>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 whitespace-nowrap">Official</span>
              <p className="text-gray-600">Published by <strong>Anthropic</strong> or an official partner. Highest trust level.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 whitespace-nowrap">Verified</span>
              <p className="text-gray-600">Passed <strong>automated validation</strong>: sandbox execution, security scan, and dependency audit by Skill of Skills.</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 whitespace-nowrap">🟢 low</span>
              <p className="text-gray-600">Standard permissions only. Safe for general use.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 whitespace-nowrap">🟡 medium</span>
              <p className="text-gray-600">Extended permissions (shell access, subagents). Review before use.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 whitespace-nowrap">🔴 high</span>
              <p className="text-gray-600">Broad system access. Carefully review before installing.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-gray-900 text-white whitespace-nowrap">⚫ critical</span>
              <p className="text-gray-600">Manual security review required. Use with extreme caution.</p>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-4 pt-4 border-t border-gray-200">
          ⚠️ <strong>Unverified tools</strong> have not been reviewed. Always inspect source code from unknown authors before installation.
        </p>
      </section>

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
