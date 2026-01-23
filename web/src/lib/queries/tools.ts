import { prisma } from '../prisma'
import type { SearchFilters, PaginatedResponse, Tool } from '@/types'

export async function getTools(
  filters: SearchFilters = {},
  page = 1,
  pageSize = 20
): Promise<PaginatedResponse<Tool>> {
  const where: any = {
    isActive: true,
    validationStatus: { in: ['passed', 'skipped'] },
  }

  if (filters.type) where.toolType = filters.type
  if (filters.category) where.category = { slug: filters.category }
  if (filters.risk) where.riskLevel = filters.risk

  const orderBy: any = {}
  switch (filters.sort) {
    case 'stars':
      orderBy.stars = 'desc'
      break
    case 'trending':
      orderBy.trendingScore = 'desc'
      break
    case 'recent':
      orderBy.discoveredAt = 'desc'
      break
    default:
      orderBy.compositeScore = 'desc'
  }

  const [tools, total] = await Promise.all([
    prisma.tool.findMany({
      where,
      include: { category: true },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.tool.count({ where }),
  ])

  return {
    data: tools as unknown as Tool[],
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

export async function getToolBySlug(slug: string): Promise<Tool | null> {
  const tool = await prisma.tool.findUnique({
    where: { slug },
    include: {
      category: true,
      ratings: true,
      comments: { where: { status: 'approved' }, orderBy: { createdAt: 'desc' } },
    },
  })

  if (!tool) return null

  const ratings = tool.ratings || []
  const averageRating = ratings.length > 0
    ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
    : 0

  return {
    ...tool,
    averageRating,
    ratingCount: ratings.length,
  } as unknown as Tool
}

export async function getTrendingTools(limit = 10): Promise<Tool[]> {
  const tools = await prisma.tool.findMany({
    where: {
      isActive: true,
      validationStatus: { in: ['passed', 'skipped'] },
      trendingScore: { gt: 0 },
    },
    include: { category: true },
    orderBy: { trendingScore: 'desc' },
    take: limit,
  })
  return tools as unknown as Tool[]
}
