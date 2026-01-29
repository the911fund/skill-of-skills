import { prisma } from '../prisma'
import type { Tool } from '@/types'

export async function searchTools(query: string, limit = 50): Promise<Tool[]> {
  try {
    if (!query || query.trim().length === 0) {
      return []
    }
    
    const searchTerm = `%${query.toLowerCase().trim()}%`
    
    // Simple but effective search across name, description, and repo_url (exclude tsvector columns)
    const tools = await prisma.$queryRaw<Tool[]>`
      SELECT 
        t.id, t.name, t.description, t.repo_url, t.tool_type, t.risk_level, 
        t.stars, t.composite_score, t.trending_score, t.category_id, 
        t.is_active, t.validation_status, t.discovered_at, t.updated_at,
        c.name as category_name, c.icon as category_icon, c.slug as category_slug
      FROM tools t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.is_active = TRUE
        AND t.validation_status IN ('passed', 'skipped')
        AND (
          LOWER(t.name) LIKE ${searchTerm} OR 
          LOWER(COALESCE(t.description, '')) LIKE ${searchTerm} OR 
          LOWER(t.repo_url) LIKE ${searchTerm}
        )
      ORDER BY 
        CASE 
          WHEN LOWER(t.name) LIKE ${searchTerm} THEN 1
          WHEN LOWER(COALESCE(t.description, '')) LIKE ${searchTerm} THEN 2
          ELSE 3 
        END,
        COALESCE(t.composite_score, 0) DESC,
        COALESCE(t.stars, 0) DESC
      LIMIT ${limit}
    `
    
    return tools || []
  } catch (error) {
    console.error('Search error:', error)
    
    // Ultimate fallback - just return recent tools
    try {
      const tools = await prisma.$queryRaw<Tool[]>`
        SELECT 
          t.id, t.name, t.description, t.repo_url, t.tool_type, t.risk_level, 
          t.stars, t.composite_score, t.trending_score, t.category_id, 
          t.is_active, t.validation_status, t.discovered_at, t.updated_at,
          c.name as category_name, c.icon as category_icon, c.slug as category_slug
        FROM tools t
        LEFT JOIN categories c ON t.category_id = c.id
        WHERE t.is_active = TRUE
          AND t.validation_status IN ('passed', 'skipped')
        ORDER BY t.discovered_at DESC
        LIMIT 10
      `
      return tools || []
    } catch (fallbackError) {
      console.error('Fallback search error:', fallbackError)
      return []
    }
  }
}