import { prisma } from '../prisma'
import type { Tool } from '@/types'

export async function searchTools(query: string, limit = 50): Promise<Tool[]> {
  // Use raw SQL for full-text search with existing tsvector
  const tools = await prisma.$queryRaw<Tool[]>`
    SELECT
      t.id, t.name, t.slug, t.repo_url as "repoUrl", t.repo_owner as "repoOwner",
      t.repo_name as "repoName", t.tool_type as "toolType", t.category_id as "categoryId",
      t.tags, t.description, t.install_command as "installCommand",
      t.has_skill_md as "hasSkillMd", t.has_claude_plugin as "hasClaudePlugin",
      t.has_mcp_json as "hasMcpJson", t.risk_level as "riskLevel",
      t.risk_reasons as "riskReasons", t.validation_status as "validationStatus",
      t.stars, t.forks, t.license, t.x_mention_count as "xMentionCount",
      t.x_recommendation_count as "xRecommendationCount",
      t.reddit_mention_count as "redditMentionCount",
      t.github_score as "githubScore", t.social_score as "socialScore",
      t.composite_score as "compositeScore", t.trending_score as "trendingScore",
      t.is_active as "isActive", t.is_official as "isOfficial",
      t.is_verified as "isVerified", t.discovered_at as "discoveredAt",
      t.updated_at as "updatedAt",
      jsonb_build_object(
        'id', c.id,
        'name', c.name,
        'slug', c.slug,
        'description', c.description,
        'icon', c.icon,
        'displayOrder', c.display_order
      ) as category
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
