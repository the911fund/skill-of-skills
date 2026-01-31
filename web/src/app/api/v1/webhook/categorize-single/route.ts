import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { categorizeTool, CategorySlug, CategorizationResult } from '@/lib/categorization'

interface RequestBody {
  tool_id?: string
  repo_url?: string
  name?: string
  description?: string
  readme_content?: string
}

interface SuccessResponse {
  success: true
  tool_id: string
  category: {
    slug: CategorySlug
    name: string
    confidence: number
  }
  reasoning: string
}

interface ErrorResponse {
  success: false
  error: string
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<SuccessResponse | ErrorResponse>> {
  try {
    const body: RequestBody = await request.json()
    const { tool_id, repo_url, name, description, readme_content } = body

    // Validate input - need either tool_id or repo_url
    if (!tool_id && !repo_url) {
      return NextResponse.json(
        { success: false, error: 'Either tool_id or repo_url is required' },
        { status: 400 }
      )
    }

    // Find the tool in the database
    let tool
    if (tool_id) {
      tool = await prisma.tool.findUnique({
        where: { id: tool_id },
        include: { category: true },
      })
    } else if (repo_url) {
      tool = await prisma.tool.findFirst({
        where: { repoUrl: repo_url },
        include: { category: true },
      })
    }

    if (!tool) {
      return NextResponse.json(
        { success: false, error: 'Tool not found' },
        { status: 404 }
      )
    }

    // Use provided data or fall back to tool data
    const toolName = name || tool.name
    const toolDescription = description || tool.description

    // Categorize the tool
    let result: CategorizationResult
    try {
      result = await categorizeTool({
        name: toolName,
        description: toolDescription,
        readmeContent: readme_content,
        tags: tool.tags,
        repoUrl: tool.repoUrl,
      })
    } catch (aiError) {
      console.error('AI categorization failed:', aiError)
      return NextResponse.json(
        {
          success: false,
          error: `AI categorization failed: ${aiError instanceof Error ? aiError.message : 'Unknown error'}`,
        },
        { status: 500 }
      )
    }

    // Find the category in the database
    const category = await prisma.category.findUnique({
      where: { slug: result.category },
    })

    if (!category) {
      // Category doesn't exist in DB - fall back to uncategorized
      console.warn(`Category ${result.category} not found in database, using uncategorized`)
      const uncategorized = await prisma.category.findUnique({
        where: { slug: 'uncategorized' },
      })

      if (!uncategorized) {
        return NextResponse.json(
          { success: false, error: 'Uncategorized category not found in database' },
          { status: 500 }
        )
      }

      // Update tool with uncategorized
      await prisma.tool.update({
        where: { id: tool.id },
        data: { categoryId: uncategorized.id },
      })

      return NextResponse.json({
        success: true,
        tool_id: tool.id,
        category: {
          slug: 'uncategorized',
          name: uncategorized.name,
          confidence: result.confidence,
        },
        reasoning: `Original category "${result.category}" not found. ${result.reasoning}`,
      })
    }

    // Update the tool with the new category
    await prisma.tool.update({
      where: { id: tool.id },
      data: { categoryId: category.id },
    })

    return NextResponse.json({
      success: true,
      tool_id: tool.id,
      category: {
        slug: result.category,
        name: category.name,
        confidence: result.confidence,
      },
      reasoning: result.reasoning,
    })
  } catch (error) {
    console.error('Categorization webhook error:', error)
    return NextResponse.json(
      {
        success: false,
        error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      },
      { status: 500 }
    )
  }
}
