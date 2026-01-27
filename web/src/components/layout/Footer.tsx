import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col items-center sm:items-start">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} Skill of Skills. Open source directory powered by Golden Ratio quality metrics.
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Built by the911fund • Validated by AI • Trusted by developers
            </p>
          </div>
          <div className="flex gap-6">
            <Link 
              href="https://github.com/the911fund/skill-of-skills" 
              className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>📦</span>
              GitHub
            </Link>
            <Link 
              href="/api/v1/tools" 
              className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              <span>🔌</span>
              API
            </Link>
            <Link 
              href="/analytics" 
              className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              <span>📈</span>
              Analytics
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
