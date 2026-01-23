import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { toolId, rating, sessionId } = body

    if (!toolId || !rating || !sessionId) {
      return NextResponse.json({ error: 'toolId, rating, and sessionId required' }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be 1-5' }, { status: 400 })
    }

    const result = await prisma.rating.upsert({
      where: { toolId_sessionId: { toolId, sessionId } },
      update: { rating },
      create: { toolId, sessionId, rating },
    })

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save rating' }, { status: 500 })
  }
}
