import Link from 'next/link'
import { Navigation } from './Navigation'

export function Header() {
  return (
    <header className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">Skill of Skills</span>
          </Link>
          <Navigation />
        </div>
      </div>
    </header>
  )
}
