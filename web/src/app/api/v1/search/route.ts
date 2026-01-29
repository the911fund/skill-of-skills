import { NextRequest, NextResponse } from 'next/server'
import { searchTools } from '@/lib/queries/search'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')

  if (!query) {
    return NextResponse.json({ error: 'Query parameter required' }, { status: 400 })
  }

  try {
    console.log('Search query:', query)
    const tools = await searchTools(query)
    console.log('Search results count:', tools?.length || 0)
    console.log('First result:', tools?.[0] || 'No results')
    return NextResponse.json(tools)
  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json({ error: 'Search failed', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
