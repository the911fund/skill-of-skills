import Link from 'next/link'

const navItems = [
  { href: '/tools', label: 'Browse', icon: '📚' },
  { href: '/categories', label: 'Categories', icon: '📂' },
  { href: '/search', label: 'Search', icon: '🔍' },
  { href: '/submit', label: 'Submit', icon: '➕' },
  { href: '/analytics', label: 'Stats', icon: '📊' },
]

export function Navigation() {
  return (
    <nav className="flex items-center gap-4">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="flex items-center gap-1 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <span className="text-xs">{item.icon}</span>
          <span className="hidden sm:inline">{item.label}</span>
        </Link>
      ))}
    </nav>
  )
}
