import { NextRequest, NextResponse } from 'next/server'
import { getCategoryBySlug } from '@/lib/queries/categories'
import { getTools } from '@/lib/queries/tools'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const [category, tools] = await Promise.all([
      getCategoryBySlug(params.slug),
      getTools({ category: params.slug }, 1, 100),
    ])

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    return NextResponse.json({ category, tools: tools.data })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch category' }, { status: 500 })
  }
}
