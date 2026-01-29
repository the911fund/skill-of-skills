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
        <div className="flex items-center justify-center gap-3 mb-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            🎯 Skill of Skills
          </h1>
          <div className="flex items-center gap-2">
            <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
              ⚡ Golden Ratio
            </span>
            <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              🤖 AI-Powered
            </span>
          </div>
        </div>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
          Curated directory of Claude Code skills, plugins, and MCP servers
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-300 mb-8">
          Discover high-quality tools validated by our Golden Ratio algorithm and community trust metrics
        </p>
        <div className="max-w-2xl mx-auto">
          <SearchBar />
        </div>
      </div>

      {/* Golden Ratio & Trust Section */}
      <section className="mb-12 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-lg font-bold text-blue-900 dark:text-blue-100">🏆 Golden Ratio Quality Filter</h2>
          <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
            NEW
          </span>
        </div>
        <p className="text-sm text-blue-700 dark:text-blue-200 mb-4">
          Our AI-powered Golden Ratio filter automatically identifies high-quality repositories based on community engagement, maintenance activity, and contributor diversity:
        </p>
        <div className="grid md:grid-cols-2 gap-4 text-sm mb-6">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">✨ Golden Ratio Criteria</h3>
            <ul className="space-y-1 text-blue-700 dark:text-blue-100 text-xs">
              <li>• ⭐ 100+ stars (community validation)</li>
              <li>• 🔀 5-20% fork ratio (healthy interest)</li>
              <li>• 🔥 Updated within 90 days (active maintenance)</li>
              <li>• 👥 3+ contributors (collaborative development)</li>
            </ul>
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">🛡️ Trust Levels</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">Official</span>
                <span className="text-gray-600 dark:text-gray-300">Anthropic verified</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">Golden</span>
                <span className="text-gray-600 dark:text-gray-300">Meets Golden Ratio</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">Verified</span>
                <span className="text-gray-600 dark:text-gray-300">AI validated</span>
              </div>
            </div>
          </div>
        </div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">🛡️ Security Risk Assessment</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          Always review tool source code before installing. These badges help you assess trustworthiness:
        </p>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 whitespace-nowrap">Official</span>
              <p className="text-gray-600 dark:text-gray-300">Published by <strong className="text-gray-900 dark:text-gray-100">Anthropic</strong> or an official partner. Highest trust level.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 whitespace-nowrap">Verified</span>
              <p className="text-gray-600 dark:text-gray-300">Passed <strong className="text-gray-900 dark:text-gray-100">automated validation</strong>: sandbox execution, security scan, and dependency audit.</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 whitespace-nowrap">🟢 low</span>
              <p className="text-gray-600 dark:text-gray-300">Standard permissions only. Safe for general use.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 whitespace-nowrap">🟡 medium</span>
              <p className="text-gray-600 dark:text-gray-300">Extended permissions (shell access, subagents). Review before use.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 whitespace-nowrap">🔴 high</span>
              <p className="text-gray-600 dark:text-gray-300">Broad system access. Carefully review before installing.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 whitespace-nowrap">⚫ critical</span>
              <p className="text-gray-600 dark:text-gray-300">Manual security review required. Use with extreme caution.</p>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-300 mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          ⚠️ <strong className="text-gray-700 dark:text-gray-200">Unverified tools</strong> have not been reviewed. Always inspect source code from unknown authors before installation.
        </p>
      </section>

      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">🔥 Trending</h2>
            <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
              Hot
            </span>
          </div>
          <Link href="/tools?sort=trending" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
            View all →
          </Link>
        </div>
        <ToolGrid tools={trending} />
      </section>

      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">🆕 Recently Added</h2>
            <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
              Fresh
            </span>
          </div>
          <Link href="/tools?sort=recent" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
            View all →
          </Link>
        </div>
        <ToolGrid tools={recent.data} />
      </section>

      <section>
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">📂 Categories</h2>
          <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
            {categories.length} Categories
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-sm dark:hover:shadow-blue-500/20 transition-all text-center group"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform block">{getCategoryIcon(cat.slug)}</span>
              <p className="font-medium mt-2 text-gray-900 dark:text-white">{cat.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-300">{cat._count?.tools || 0} tools</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
