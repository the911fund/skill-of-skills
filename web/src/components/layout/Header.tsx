'use client'

import Link from 'next/link'
import { Navigation } from './Navigation'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

export function Header() {
  return (
    <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 sticky top-0 z-50 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-2xl">🎯</span>
            <span className="text-xl font-bold text-gray-900 dark:text-white">Skill of Skills</span>
            <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full ml-2">
              Golden Ratio
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Navigation />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}
