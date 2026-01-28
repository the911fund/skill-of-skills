export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { getCategories } from '@/lib/queries/categories'
import { getCategoryIcon } from '@/lib/utils'

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold dark:text-gray-100 mb-8">Categories</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <Link key={cat.id} href={`/categories/${cat.slug}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <span className="text-4xl">{getCategoryIcon(cat.slug)}</span>
                <div>
                  <h2 className="text-xl font-semibold dark:text-gray-100">{cat.name}</h2>
                  <p className="text-gray-500 dark:text-gray-400">{cat._count?.tools || 0} tools</p>
                </div>
              </div>
              {cat.description && (
                <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">{cat.description}</p>
              )}
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
