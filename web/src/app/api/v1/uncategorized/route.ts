import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Find tools without categories
    const uncategorizedTools = await prisma.$queryRaw<{
      id: string, 
      name: string, 
      repo_url: string,
      tool_type: string,
      description: string
    }[]>`
      SELECT id, name, repo_url, tool_type, description
      FROM tools 
      WHERE category_id IS NULL 
        AND is_active = TRUE
      ORDER BY name
    `
    
    // Get current categories for reference
    const categories = await prisma.$queryRaw<{
      id: string,
      name: string, 
      slug: string
    }[]>`
      SELECT id, name, slug
      FROM categories
      ORDER BY name
    `
    
    return NextResponse.json({
      uncategorizedTools,
      categories,
      count: uncategorizedTools.length
    })
  } catch (error) {
    console.error('Uncategorized tools error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}