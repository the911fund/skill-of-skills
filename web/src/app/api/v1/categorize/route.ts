import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { toolId, categoryId } = await request.json()
    
    if (!toolId || !categoryId) {
      return NextResponse.json({ 
        error: 'toolId and categoryId required' 
      }, { status: 400 })
    }
    
    // Update tool category
    const result = await prisma.$executeRaw`
      UPDATE tools 
      SET category_id = ${categoryId}::uuid, updated_at = NOW()
      WHERE id = ${toolId}::uuid
    `
    
    if (result === 0) {
      return NextResponse.json({ 
        error: 'Tool not found' 
      }, { status: 404 })
    }
    
    // Get updated tool info
    const updatedTool = await prisma.$queryRaw<{
      name: string,
      category_name: string
    }[]>`
      SELECT t.name, c.name as category_name
      FROM tools t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.id = ${toolId}::uuid
    `
    
    return NextResponse.json({
      success: true,
      message: `Tool "${updatedTool[0]?.name}" categorized as "${updatedTool[0]?.category_name}"`,
      tool: updatedTool[0]
    })
  } catch (error) {
    console.error('Categorization error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Categorization failed'
    }, { status: 500 })
  }
}

// Auto-categorize endpoint
export async function GET() {
  try {
    // Auto-categorize swarm as an Agent tool
    const swarmResult = await prisma.$executeRaw`
      UPDATE tools 
      SET category_id = '053a92d7-4f10-4699-90fa-e37279b11247'::uuid, updated_at = NOW()
      WHERE name = 'swarm' AND category_id IS NULL
    `
    
    // Get final count of uncategorized tools
    const uncategorizedCount = await prisma.$queryRaw<[{count: bigint}]>`
      SELECT COUNT(*) as count FROM tools WHERE category_id IS NULL AND is_active = TRUE
    `
    
    const finalCount = Number(uncategorizedCount[0]?.count || 0)
    
    return NextResponse.json({
      success: true,
      message: `Auto-categorized ${swarmResult} tool(s)`,
      remainingUncategorized: finalCount,
      actions: [
        swarmResult > 0 ? 'swarm → Agents category' : 'swarm already categorized'
      ]
    })
  } catch (error) {
    console.error('Auto-categorization error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Auto-categorization failed'
    }, { status: 500 })
  }
}