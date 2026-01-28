import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} Skill of Skills. Open source directory.
          </p>
          <div className="flex gap-4">
            <Link href="https://github.com/911fund/skill-of-skills" className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              GitHub
            </Link>
            <Link href="/api/v1/tools" className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              API
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
