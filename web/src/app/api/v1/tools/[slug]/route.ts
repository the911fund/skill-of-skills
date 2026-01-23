import { NextRequest, NextResponse } from 'next/server'
import { getToolBySlug } from '@/lib/queries/tools'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const tool = await getToolBySlug(params.slug)

    if (!tool) {
      return NextResponse.json({ error: 'Tool not found' }, { status: 404 })
    }

    return NextResponse.json(tool)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tool' }, { status: 500 })
  }
}
