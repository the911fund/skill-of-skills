import Anthropic from '@anthropic-ai/sdk'

// Category definitions from taxonomy.json
export const CATEGORIES = [
  {
    slug: 'official',
    name: 'Official',
    description: 'Tools from Anthropic or verified partners with official endorsement',
    keywords: ['anthropic', 'official', 'claude', 'partner'],
  },
  {
    slug: 'development',
    name: 'Development',
    description: 'Code generation, debugging, testing, DevOps, IDE integrations, and developer tools',
    keywords: ['code', 'debug', 'test', 'dev', 'ide', 'git', 'ci', 'build', 'lint', 'format'],
  },
  {
    slug: 'documentation',
    name: 'Documentation',
    description: 'README generation, docs, comments, wikis, and technical writing',
    keywords: ['readme', 'docs', 'documentation', 'wiki', 'comment', 'markdown', 'technical writing'],
  },
  {
    slug: 'marketing',
    name: 'Marketing',
    description: 'SEO, content marketing, social media, copywriting, and brand content',
    keywords: ['seo', 'marketing', 'social', 'copy', 'content', 'brand', 'advertising', 'campaign'],
  },
  {
    slug: 'productivity',
    name: 'Productivity',
    description: 'Task management, automation, workflows, scheduling, and efficiency tools',
    keywords: ['task', 'automation', 'workflow', 'schedule', 'productivity', 'organize', 'todo'],
  },
  {
    slug: 'media',
    name: 'Media',
    description: 'Image, video, audio processing, generation, and multimedia tools',
    keywords: ['image', 'video', 'audio', 'media', 'photo', 'music', 'visual', 'graphics'],
  },
  {
    slug: 'research',
    name: 'Research',
    description: 'Data analysis, web scraping, summarization, information retrieval, and research tools',
    keywords: ['data', 'analysis', 'scrape', 'summarize', 'research', 'extract', 'crawl', 'aggregate'],
  },
  {
    slug: 'security',
    name: 'Security',
    description: 'Authentication, encryption, vulnerability scanning, and security tools',
    keywords: ['auth', 'security', 'encrypt', 'vulnerability', 'scan', 'protect', 'privacy'],
  },
  {
    slug: 'integrations',
    name: 'Integrations',
    description: 'API connectors, third-party services, webhooks, and platform integrations',
    keywords: ['api', 'integrate', 'connect', 'webhook', 'service', 'platform', 'sync'],
  },
  {
    slug: 'agents',
    name: 'Agents',
    description: 'Autonomous agents, multi-step workflows, and agentic AI systems',
    keywords: ['agent', 'autonomous', 'agentic', 'multi-step', 'reasoning', 'planning'],
  },
  {
    slug: 'uncategorized',
    name: 'Uncategorized',
    description: 'Tools that do not fit other categories or have unclear purpose',
    keywords: [],
  },
] as const

export type CategorySlug = (typeof CATEGORIES)[number]['slug']

export interface CategorizationResult {
  category: CategorySlug
  confidence: number
  reasoning: string
}

export interface CategorizationInput {
  name: string
  description?: string | null
  readmeContent?: string | null
  tags?: string[]
  repoUrl?: string | null
}

/**
 * Build the system prompt for categorization
 */
function buildSystemPrompt(): string {
  const categoryList = CATEGORIES.map(
    (c) => `- ${c.slug}: ${c.description}`
  ).join('\n')

  return `You are a tool categorization assistant. Your job is to categorize Claude Code tools into the most appropriate category based on their name, description, and README content.

Available categories:
${categoryList}

IMPORTANT RULES:
1. Only use "official" for tools explicitly from Anthropic or verified partners
2. If a tool could fit multiple categories, choose the most specific one
3. Default to "uncategorized" only when genuinely unclear
4. Provide a confidence score between 0.0 and 1.0
5. Keep reasoning brief (1-2 sentences)

Always respond with valid JSON in this exact format:
{"category": "slug", "confidence": 0.85, "reasoning": "Brief explanation"}`
}

/**
 * Build the user prompt with tool information
 */
function buildUserPrompt(input: CategorizationInput): string {
  const parts = [`Tool Name: ${input.name}`]

  if (input.description) {
    parts.push(`Description: ${input.description}`)
  }

  if (input.tags && input.tags.length > 0) {
    parts.push(`Tags: ${input.tags.join(', ')}`)
  }

  if (input.repoUrl) {
    parts.push(`Repository: ${input.repoUrl}`)
  }

  if (input.readmeContent) {
    // Truncate README to avoid token limits
    const maxLength = 2000
    const truncated =
      input.readmeContent.length > maxLength
        ? input.readmeContent.slice(0, maxLength) + '...[truncated]'
        : input.readmeContent
    parts.push(`README excerpt:\n${truncated}`)
  }

  parts.push('\nCategorize this tool. Respond with JSON only.')

  return parts.join('\n\n')
}

/**
 * Parse the AI response into a structured result
 */
function parseResponse(content: string): CategorizationResult {
  // Try to extract JSON from the response
  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('No JSON found in response')
  }

  const parsed = JSON.parse(jsonMatch[0])

  // Validate the category slug
  const validSlugs = CATEGORIES.map((c) => c.slug)
  if (!validSlugs.includes(parsed.category)) {
    throw new Error(`Invalid category: ${parsed.category}`)
  }

  return {
    category: parsed.category as CategorySlug,
    confidence: Math.min(1, Math.max(0, parseFloat(parsed.confidence) || 0.5)),
    reasoning: parsed.reasoning || 'No reasoning provided',
  }
}

/**
 * Categorize a tool using Claude AI
 */
export async function categorizeTool(
  input: CategorizationInput,
  apiKey?: string
): Promise<CategorizationResult> {
  const key = apiKey || process.env.ANTHROPIC_API_KEY
  if (!key) {
    throw new Error('ANTHROPIC_API_KEY is required')
  }

  const client = new Anthropic({ apiKey: key })

  const response = await client.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 256,
    system: buildSystemPrompt(),
    messages: [
      {
        role: 'user',
        content: buildUserPrompt(input),
      },
    ],
  })

  const textContent = response.content.find((c) => c.type === 'text')
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text response from AI')
  }

  return parseResponse(textContent.text)
}

/**
 * Get category ID from the database by slug
 */
export function getCategoryBySlug(slug: CategorySlug) {
  return CATEGORIES.find((c) => c.slug === slug)
}
