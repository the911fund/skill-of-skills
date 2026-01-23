import { NextRequest, NextResponse } from 'next/server'
import { getTools } from '@/lib/queries/tools'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const type = searchParams.get('type') || undefined
  const category = searchParams.get('category') || undefined
  const sort = (searchParams.get('sort') as any) || 'score'
  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = parseInt(searchParams.get('limit') || '20')

  try {
    const result = await getTools({ type, category, sort }, page, pageSize)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tools' }, { status: 500 })
  }
}
