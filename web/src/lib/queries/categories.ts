import { prisma } from '../prisma'
import type { Category } from '@/types'

export async function getCategories(): Promise<Category[]> {
  const categories = await prisma.category.findMany({
    orderBy: { displayOrder: 'asc' },
    include: {
      _count: {
        select: {
          tools: {
            where: {
              isActive: true,
              validationStatus: { in: ['passed', 'skipped'] },
            },
          },
        },
      },
    },
  })
  return categories as unknown as Category[]
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      _count: {
        select: {
          tools: {
            where: {
              isActive: true,
              validationStatus: { in: ['passed', 'skipped'] },
            },
          },
        },
      },
    },
  })
  return category as unknown as Category | null
}
