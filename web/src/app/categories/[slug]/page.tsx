export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { ToolGrid } from '@/components/tools/ToolGrid'
import { getCategoryBySlug } from '@/lib/queries/categories'
import { getTools } from '@/lib/queries/tools'
import { getCategoryIcon } from '@/lib/utils'

interface Props {
  params: { slug: string }
}

export default async function CategoryPage({ params }: Props) {
  const [category, tools] = await Promise.all([
    getCategoryBySlug(params.slug),
    getTools({ category: params.slug }, 1, 50),
  ])

  if (!category) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">{getCategoryIcon(category.slug)}</span>
          <h1 className="text-3xl font-bold">{category.name}</h1>
        </div>
        {category.description && (
          <p className="text-gray-600">{category.description}</p>
        )}
        <p className="text-sm text-gray-500 mt-2">{tools.total} tools</p>
      </div>

      <ToolGrid tools={tools.data} />
    </div>
  )
}
