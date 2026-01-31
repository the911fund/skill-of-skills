import Link from 'next/link'

const navItems = [
  { href: '/tools', label: 'Browse' },
  { href: '/trending', label: 'Trending' },
  { href: '/categories', label: 'Categories' },
  { href: '/search', label: 'Search' },
  { href: '/analytics', label: 'Stats' },
]

export function Navigation() {
  return (
    <nav className="flex items-center gap-6">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  )
}
