import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { repoUrl, name, description, toolType } = body

    if (!repoUrl || !name) {
      return NextResponse.json({ error: 'repoUrl and name are required' }, { status: 400 })
    }

    // Check for duplicates
    const existing = await prisma.discoveryQueue.findFirst({
      where: { repoUrl },
    })

    if (existing) {
      return NextResponse.json({ error: 'This tool has already been submitted' }, { status: 409 })
    }

    // Add to discovery queue
    const submission = await prisma.discoveryQueue.create({
      data: {
        repoUrl,
        toolName: name,
        source: 'manual_submission',
        discoveredBy: 'web_form',
        status: 'pending',
      },
    })

    return NextResponse.json({ success: true, id: submission.id })
  } catch (error) {
    return NextResponse.json({ error: 'Submission failed' }, { status: 500 })
  }
}
