export const dynamic = 'force-dynamic'

import { SearchBar } from '@/components/search/SearchBar'
import { ToolGrid } from '@/components/tools/ToolGrid'
import { getTools } from '@/lib/queries/tools'
import { getCategories } from '@/lib/queries/categories'
import Link from 'next/link'
import { getCategoryIcon } from '@/lib/utils'

export default async function HomePage() {
  const [recent, categories] = await Promise.all([
    getTools({ sort: 'recent' }, 1, 6),
    getCategories(),
  ])

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          🎯 Skill of Skills
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          Curated directory of Claude Code skills, plugins, and MCP servers
        </p>
        <div className="max-w-2xl mx-auto">
          <SearchBar />
        </div>
      </div>

      {/* Trust & Safety Legend */}
      <section className="mb-12 p-6 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-bold dark:text-gray-100 mb-4">🛡️ Trust & Verification Guide</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          Always review tool source code before installing. These badges help you assess trustworthiness:
        </p>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 whitespace-nowrap">Official</span>
              <p className="text-gray-600 dark:text-gray-300">Published by <strong>Anthropic</strong> or an official partner. Highest trust level.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 whitespace-nowrap">Verified</span>
              <p className="text-gray-600 dark:text-gray-300"><em>(pending)</em> Will pass <strong>automated validation</strong>: sandbox execution, security scan, and dependency audit.</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 whitespace-nowrap">🟢 low</span>
              <p className="text-gray-600 dark:text-gray-300">Standard permissions only. Safe for general use.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 whitespace-nowrap">🟡 medium</span>
              <p className="text-gray-600 dark:text-gray-300">Extended permissions (shell access, subagents). Review before use.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 whitespace-nowrap">🔴 high</span>
              <p className="text-gray-600 dark:text-gray-300">Broad system access. Carefully review before installing.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 whitespace-nowrap">⚫ critical</span>
              <p className="text-gray-600 dark:text-gray-300">Manual security review required. Use with extreme caution.</p>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          ⚠️ <strong>Unverified tools</strong> have not been reviewed. Always inspect source code from unknown authors before installation.
        </p>
      </section>

      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold dark:text-gray-100">🆕 Recently Added</h2>
          <Link href="/tools?sort=recent" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
            View all →
          </Link>
        </div>
        <ToolGrid tools={recent.data} />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold dark:text-gray-100 mb-6">📂 Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-500 hover:shadow-sm transition-all text-center dark:bg-gray-800"
            >
              <span className="text-2xl">{getCategoryIcon(cat.slug)}</span>
              <p className="font-medium dark:text-gray-100 mt-2">{cat.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{cat._count?.tools || 0} tools</p>
            </Link>
          ))}
        </div>
      </section>

      {/* How It Works - Transparency Section */}
      <section className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-bold dark:text-gray-100 mb-4">🔍 How It Works</h2>
        <div className="grid md:grid-cols-2 gap-6 text-sm">
          <div>
            <h3 className="font-semibold dark:text-gray-100 mb-2">Discovery</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Repos are automatically discovered by scanning GitHub for Claude Code related projects
              (skills, plugins, MCP servers). We search for specific file patterns like <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">SKILL.md</code>,
              <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">mcp.json</code>, and keywords in descriptions.
            </p>
          </div>
          <div>
            <h3 className="font-semibold dark:text-gray-100 mb-2">Validation <span className="text-xs text-gray-400">(pending)</span></h3>
            <p className="text-gray-600 dark:text-gray-300">
              Each tool will be validated in a sandbox environment. We&apos;ll check for proper structure,
              run security scans, and audit dependencies before listing.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
