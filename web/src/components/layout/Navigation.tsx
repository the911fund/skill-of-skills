import Link from 'next/link'

const navItems = [
  { href: '/tools', label: 'Browse' },
  { href: '/categories', label: 'Categories' },
  { href: '/search', label: 'Search' },
  { href: '/submit', label: 'Submit' },
  { href: '/analytics', label: 'Stats' },
]

export function Navigation() {
  return (
    <nav className="flex items-center gap-6">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  )
}
