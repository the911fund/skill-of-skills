import { NextRequest, NextResponse } from 'next/server'
import { getTrendingTools } from '@/lib/queries/tools'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '10')

  try {
    const tools = await getTrendingTools(limit)
    return NextResponse.json(tools)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch trending tools' }, { status: 500 })
  }
}
