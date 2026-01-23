import { prisma } from '../prisma'
import type { Stats, Tool } from '@/types'

export async function getStats(): Promise<Stats> {
  const [totalTools, totalCategories, toolsByType, toolsByCategory, recentlyAdded, starsResult] =
    await Promise.all([
      prisma.tool.count({
        where: { isActive: true, validationStatus: { in: ['passed', 'skipped'] } },
      }),
      prisma.category.count(),
      prisma.tool.groupBy({
        by: ['toolType'],
        where: { isActive: true, validationStatus: { in: ['passed', 'skipped'] } },
        _count: true,
      }),
      prisma.tool.groupBy({
        by: ['categoryId'],
        where: { isActive: true, validationStatus: { in: ['passed', 'skipped'] } },
        _count: true,
      }),
      prisma.tool.findMany({
        where: { isActive: true, validationStatus: { in: ['passed', 'skipped'] } },
        include: { category: true },
        orderBy: { discoveredAt: 'desc' },
        take: 5,
      }),
      prisma.tool.aggregate({
        where: { isActive: true, validationStatus: { in: ['passed', 'skipped'] } },
        _sum: { stars: true },
      }),
    ])

  const categories = await prisma.category.findMany()
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]))

  return {
    totalTools,
    totalCategories,
    totalStars: starsResult._sum.stars || 0,
    toolsByType: toolsByType.map((t) => ({ type: t.toolType, count: t._count })),
    toolsByCategory: toolsByCategory.map((c) => ({
      category: categoryMap.get(c.categoryId || '') || 'Uncategorized',
      count: c._count,
    })),
    recentlyAdded: recentlyAdded as unknown as Tool[],
  }
}
