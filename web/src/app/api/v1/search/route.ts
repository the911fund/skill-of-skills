import { NextRequest, NextResponse } from 'next/server'
import { searchTools } from '@/lib/queries/search'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')

  if (!query) {
    return NextResponse.json({ error: 'Query parameter required' }, { status: 400 })
  }

  try {
    const tools = await searchTools(query)
    return NextResponse.json(tools)
  } catch (error) {
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
