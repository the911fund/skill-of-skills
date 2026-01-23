import { prisma } from '../prisma'
import type { Tool } from '@/types'

export async function searchTools(query: string, limit = 50): Promise<Tool[]> {
  // Use raw SQL for full-text search with existing tsvector
  const tools = await prisma.$queryRaw<Tool[]>`
    SELECT t.*, c.name as category_name, c.icon as category_icon
    FROM tools t
    LEFT JOIN categories c ON t.category_id = c.id
    WHERE t.is_active = TRUE
      AND t.validation_status IN ('passed', 'skipped')
      AND t.search_vector @@ plainto_tsquery('english', ${query})
    ORDER BY ts_rank(t.search_vector, plainto_tsquery('english', ${query})) DESC
    LIMIT ${limit}
  `
  return tools
}
