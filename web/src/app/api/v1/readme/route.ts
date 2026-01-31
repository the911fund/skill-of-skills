import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const TOOL_TYPE_ICONS: Record<string, string> = {
  skill: '📄',
  plugin: '🔌',
  collection: '📦',
  cli_tool: '⌨️',
  mcp_server: '🔗',
  prompt_pack: '📝',
  workflow: '🔄',
  extension: '🧩',
  resource: '📚',
}

const RISK_ICONS: Record<string, string> = {
  low: '🟢',
  medium: '🟡',
  high: '🔴',
  critical: '⚫',
}

const CATEGORY_ICONS: Record<string, string> = {
  official: '✅',
  development: '🛠️',
  documentation: '📚',
  marketing: '📣',
  productivity: '⚡',
  media: '🎬',
  research: '🔬',
  security: '🔒',
  integrations: '🔗',
  agents: '🤖',
  uncategorized: '📦',
}

export async function GET() {
  try {
    const [tools, trendingTools, categories, starsResult] = await Promise.all([
      prisma.tool.findMany({
        where: { isActive: true, validationStatus: { in: ['passed', 'skipped'] } },
        include: { category: true },
        orderBy: { compositeScore: 'desc' },
      }),
      // Separate query for trending (top 6 by trendingScore) - matches home page
      prisma.tool.findMany({
        where: { isActive: true, validationStatus: { in: ['passed', 'skipped'] }, trendingScore: { gt: 0 } },
        orderBy: { trendingScore: 'desc' },
        take: 6,
      }),
      prisma.category.findMany({ orderBy: { displayOrder: 'asc' } }),
      prisma.tool.aggregate({
        where: { isActive: true, validationStatus: { in: ['passed', 'skipped'] } },
        _sum: { stars: true },
      }),
    ])

    const totalTools = tools.length
    const totalCategories = categories.length
    const totalStars = starsResult._sum.stars || 0

    // Generate trending section (top 6 by trendingScore - matches home page)
    const trendingSection = trendingTools.length > 0
      ? trendingTools.map(t => {
          const icon = TOOL_TYPE_ICONS[t.toolType] || '📄'
          const risk = RISK_ICONS[t.riskLevel] || '🟢'
          const stars = t.stars >= 1000 ? `${(t.stars / 1000).toFixed(1)}k` : t.stars
          return `- ${icon} **[${t.name}](${t.repoUrl})** ${risk} — ${t.description || 'No description'} *(${stars} ⭐)*`
        }).join('\n')
      : '*No trending tools yet*'

    // Generate category sections
    const categorySections = categories.map(cat => {
      const catTools = tools.filter(t => t.categoryId === cat.id)
      if (catTools.length === 0) return ''

      const icon = CATEGORY_ICONS[cat.slug] || '📦'
      const toolsList = catTools.map(t => {
        const typeIcon = TOOL_TYPE_ICONS[t.toolType] || '📄'
        const risk = RISK_ICONS[t.riskLevel] || '🟢'
        const stars = t.stars >= 1000 ? `${(t.stars / 1000).toFixed(1)}k` : t.stars
        const author = t.repoOwner ? ` by ${t.repoOwner}` : ''
        return `- ${typeIcon} **[${t.name}](${t.repoUrl})** ${risk} — ${t.description || 'No description'}${author} *(${stars} ⭐)*`
      }).join('\n')

      return `## ${icon} ${cat.name}\n\n${toolsList}`
    }).filter(Boolean).join('\n\n')

    // Generate README
    const timestamp = new Date().toISOString().split('T')[0]
    const readme = `# 🎯 Skill of Skills

> A curated directory of Claude Code skills, plugins, MCP servers, and tools for the AI coding ecosystem.

[![Tools](https://img.shields.io/badge/tools-${totalTools}-blue)](https://github.com/the911fund/skill-of-skills)
[![Categories](https://img.shields.io/badge/categories-${totalCategories}-green)](https://github.com/the911fund/skill-of-skills)
[![Stars](https://img.shields.io/badge/total_stars-${totalStars >= 1000 ? Math.round(totalStars / 1000) + 'k' : totalStars}-yellow)](https://github.com/the911fund/skill-of-skills)

**${totalTools} tools** discovered across ${totalCategories} categories

🌐 **[Browse the Directory](https://skillofskills.dev)** | 📊 **[Analytics](https://skillofskills.dev/analytics)** | ➕ **[Submit a Tool](https://skillofskills.dev/submit)**

---

## Contents

${categories.map(c => `- [${c.name}](#-${c.slug})`).join('\n')}

---

## 🔥 Trending

${trendingSection}

---

${categorySections}

---

## Tool Types

| Icon | Type | Description |
|:----:|------|-------------|
| 📄 | Skill | Claude Code skill files (SKILL.md) |
| 🔌 | Plugin | Claude Code plugins |
| 📦 | Collection | Curated skill collections |
| ⌨️ | CLI Tool | Command-line tools |
| 🔗 | MCP Server | Model Context Protocol servers |
| 📝 | Prompt Pack | Reusable prompt templates |
| 🔄 | Workflow | Automation workflows |
| 🧩 | Extension | IDE extensions |
| 📚 | Resource | Documentation & guides |

## Risk Levels

| Icon | Level | Description |
|:----:|-------|-------------|
| 🟢 | Low | Standard permissions, safe to use |
| 🟡 | Medium | Extended permissions (shell access, subagents) |
| 🔴 | High | Broad system access, review before use |
| ⚫ | Critical | Manual review required |

---

## Contributing

Found a great Claude Code tool? [Submit it here](https://skillofskills.dev/submit) or open a PR!

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## How It Works

This directory is automatically updated by the Skill of Skills discovery engine:

1. **Discovery** — Scans GitHub, X/Twitter, and Reddit for Claude Code tools
2. **Validation** — Tests tools in a sandbox environment
3. **Scoring** — Ranks by GitHub stars, social mentions, and recency
4. **Publishing** — Updates this README and the web directory

## License

MIT License - see [LICENSE](LICENSE)

---

<p align="center">
  <sub>🤖 Auto-generated ${timestamp} by <a href="https://github.com/the911fund/skill-of-skills">Skill of Skills</a></sub>
</p>
`

    return new NextResponse(readme, {
      headers: { 'Content-Type': 'text/markdown' },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate README' }, { status: 500 })
  }
}
