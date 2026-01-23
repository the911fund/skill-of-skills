import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const toolId = searchParams.get('toolId')

  if (!toolId) {
    return NextResponse.json({ error: 'toolId required' }, { status: 400 })
  }

  try {
    const comments = await prisma.comment.findMany({
      where: { toolId, status: 'approved' },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(comments)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { toolId, content, author, sessionId } = body

    if (!toolId || !content || !sessionId) {
      return NextResponse.json({ error: 'toolId, content, and sessionId required' }, { status: 400 })
    }

    const comment = await prisma.comment.create({
      data: {
        toolId,
        sessionId,
        author: author || null,
        content,
        status: 'pending',
      },
    })

    return NextResponse.json(comment)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save comment' }, { status: 500 })
  }
}
