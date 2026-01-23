import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('sessionId')

  if (!sessionId) {
    return NextResponse.json({ error: 'sessionId required' }, { status: 400 })
  }

  try {
    const favorites = await prisma.favorite.findMany({
      where: { sessionId },
      include: { tool: { include: { category: true } } },
    })

    return NextResponse.json(favorites.map((f) => f.tool))
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { toolId, sessionId, action } = body

    if (!toolId || !sessionId) {
      return NextResponse.json({ error: 'toolId and sessionId required' }, { status: 400 })
    }

    if (action === 'remove') {
      await prisma.favorite.deleteMany({
        where: { toolId, sessionId },
      })
    } else {
      await prisma.favorite.upsert({
        where: { toolId_sessionId: { toolId, sessionId } },
        update: {},
        create: { toolId, sessionId },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update favorite' }, { status: 500 })
  }
}
