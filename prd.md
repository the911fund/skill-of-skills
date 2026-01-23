# Skill of Skills - Web Application PRD

## Overview

Build a complete web application for the Skill of Skills directory - a curated collection of Claude Code skills, plugins, and MCP servers. The data pipeline already exists (PostgreSQL + n8n workflows). This PRD specifies the missing frontend and API layer.

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Database ORM**: Prisma
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Runtime**: Node.js 20+

## Directory Structure

```
web/
├── package.json
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── postcss.config.js
├── .env.local.example
├── prisma/
│   └── schema.prisma
├── public/
│   └── favicon.ico
└── src/
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx
    │   ├── globals.css
    │   ├── tools/
    │   │   ├── page.tsx
    │   │   └── [slug]/
    │   │       └── page.tsx
    │   ├── categories/
    │   │   ├── page.tsx
    │   │   └── [slug]/
    │   │       └── page.tsx
    │   ├── search/
    │   │   └── page.tsx
    │   ├── submit/
    │   │   └── page.tsx
    │   ├── analytics/
    │   │   └── page.tsx
    │   └── api/
    │       └── v1/
    │           ├── tools/
    │           │   ├── route.ts
    │           │   ├── trending/
    │           │   │   └── route.ts
    │           │   └── [slug]/
    │           │       └── route.ts
    │           ├── categories/
    │           │   ├── route.ts
    │           │   └── [slug]/
    │           │       └── route.ts
    │           ├── search/
    │           │   └── route.ts
    │           ├── submit/
    │           │   └── route.ts
    │           ├── stats/
    │           │   └── route.ts
    │           ├── ratings/
    │           │   └── route.ts
    │           ├── favorites/
    │           │   └── route.ts
    │           └── comments/
    │               └── route.ts
    ├── components/
    │   ├── layout/
    │   │   ├── Header.tsx
    │   │   ├── Footer.tsx
    │   │   └── Navigation.tsx
    │   ├── tools/
    │   │   ├── ToolCard.tsx
    │   │   ├── ToolGrid.tsx
    │   │   ├── ToolDetail.tsx
    │   │   ├── RiskBadge.tsx
    │   │   ├── TypeBadge.tsx
    │   │   └── InstallCommand.tsx
    │   ├── search/
    │   │   ├── SearchBar.tsx
    │   │   ├── SearchFilters.tsx
    │   │   └── SearchResults.tsx
    │   ├── engagement/
    │   │   ├── RatingStars.tsx
    │   │   ├── CommentSection.tsx
    │   │   └── FavoriteButton.tsx
    │   ├── analytics/
    │   │   ├── StatsCard.tsx
    │   │   ├── TrendChart.tsx
    │   │   └── TypeDistribution.tsx
    │   └── ui/
    │       ├── Button.tsx
    │       ├── Input.tsx
    │       ├── Select.tsx
    │       ├── Badge.tsx
    │       ├── Card.tsx
    │       └── Pagination.tsx
    ├── lib/
    │   ├── prisma.ts
    │   ├── utils.ts
    │   └── queries/
    │       ├── tools.ts
    │       ├── categories.ts
    │       ├── search.ts
    │       └── stats.ts
    └── types/
        └── index.ts
```

---

## File: package.json

```json
{
  "name": "skill-of-skills-web",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:studio": "prisma studio"
  },
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "@prisma/client": "^5.14.0",
    "clsx": "^2.1.0",
    "date-fns": "^3.6.0"
  },
  "devDependencies": {
    "@types/node": "^20.12.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "autoprefixer": "^10.4.19",
    "eslint": "^8.57.0",
    "eslint-config-next": "^14.2.0",
    "postcss": "^8.4.38",
    "prisma": "^5.14.0",
    "tailwindcss": "^3.4.3",
    "typescript": "^5.4.0"
  }
}
```

---

## File: prisma/schema.prisma

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["fullTextSearch"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum ToolType {
  skill
  plugin
  collection
  cli_tool
  mcp_server
  prompt_pack
  workflow
  extension
  resource

  @@map("tool_type")
}

enum DiscoverySource {
  github_search
  github_official
  x_post
  x_reply
  x_entity_extraction
  reddit_post
  manual_submission
  influencer_recommendation

  @@map("discovery_source")
}

enum RiskLevel {
  low
  medium
  high
  critical

  @@map("risk_level")
}

enum ValidationStatus {
  pending
  validating
  passed
  failed
  skipped
  manual_review

  @@map("validation_status")
}

model Category {
  id           String   @id @default(uuid()) @db.Uuid
  name         String   @unique
  slug         String   @unique
  description  String?
  icon         String?
  keywords     String[] @default([])
  displayOrder Int      @default(0) @map("display_order")
  createdAt    DateTime @default(now()) @map("created_at") @db.Timestamptz
  tools        Tool[]

  @@map("categories")
}

model Tool {
  id                    String           @id @default(uuid()) @db.Uuid
  name                  String
  slug                  String           @unique
  repoUrl               String?          @unique @map("repo_url")
  repoOwner             String?          @map("repo_owner")
  repoName              String?          @map("repo_name")
  toolType              ToolType         @default(skill) @map("tool_type")
  categoryId            String?          @map("category_id") @db.Uuid
  category              Category?        @relation(fields: [categoryId], references: [id])
  tags                  String[]         @default([])
  description           String?
  installCommand        String?          @map("install_command")
  hasSkillMd            Boolean          @default(false) @map("has_skill_md")
  hasClaudePlugin       Boolean          @default(false) @map("has_claude_plugin")
  hasMcpJson            Boolean          @default(false) @map("has_mcp_json")
  riskLevel             RiskLevel        @default(low) @map("risk_level")
  riskReasons           String[]         @default([]) @map("risk_reasons")
  validationStatus      ValidationStatus @default(pending) @map("validation_status")
  lastValidatedAt       DateTime?        @map("last_validated_at") @db.Timestamptz
  spawnsSubagents       Boolean          @default(false) @map("spawns_subagents")
  stars                 Int              @default(0)
  forks                 Int              @default(0)
  lastCommitAt          DateTime?        @map("last_commit_at") @db.Timestamptz
  license               String?
  xMentionCount         Int              @default(0) @map("x_mention_count")
  xRecommendationCount  Int              @default(0) @map("x_recommendation_count")
  redditMentionCount    Int              @default(0) @map("reddit_mention_count")
  githubScore           Float            @default(0) @map("github_score")
  socialScore           Float            @default(0) @map("social_score")
  recencyScore          Float            @default(0) @map("recency_score")
  influencerScore       Float            @default(0) @map("influencer_score")
  compositeScore        Float            @default(0) @map("composite_score")
  trendingScore         Float            @default(0) @map("trending_score")
  source                DiscoverySource
  sourceUrl             String?          @map("source_url")
  discoveredBy          String?          @map("discovered_by")
  isActive              Boolean          @default(true) @map("is_active")
  isOfficial            Boolean          @default(false) @map("is_official")
  isVerified            Boolean          @default(false) @map("is_verified")
  discoveredAt          DateTime         @default(now()) @map("discovered_at") @db.Timestamptz
  updatedAt             DateTime         @default(now()) @updatedAt @map("updated_at") @db.Timestamptz
  socialMentions        SocialMention[]
  metricsHistory        MetricsHistory[]
  ratings               Rating[]
  comments              Comment[]
  favorites             Favorite[]

  @@index([compositeScore(sort: Desc)], map: "idx_tools_composite")
  @@index([trendingScore(sort: Desc)], map: "idx_tools_trending")
  @@index([toolType], map: "idx_tools_type")
  @@map("tools")
}

model Influencer {
  id                      String          @id @default(uuid()) @db.Uuid
  platform                String
  username                String
  displayName             String?         @map("display_name")
  followers               Int             @default(0)
  recommendationCount     Int             @default(0) @map("recommendation_count")
  accurateRecommendations Int             @default(0) @map("accurate_recommendations")
  trustScore              Float           @default(0.5) @map("trust_score")
  isVerified              Boolean         @default(false) @map("is_verified")
  isOfficial              Boolean         @default(false) @map("is_official")
  firstSeenAt             DateTime        @default(now()) @map("first_seen_at") @db.Timestamptz
  lastActiveAt            DateTime        @default(now()) @map("last_active_at") @db.Timestamptz
  socialMentions          SocialMention[]
  unknownMentions         UnknownMention[]

  @@unique([platform, username])
  @@map("influencers")
}

model SocialMention {
  id              String      @id @default(uuid()) @db.Uuid
  toolId          String?     @map("tool_id") @db.Uuid
  tool            Tool?       @relation(fields: [toolId], references: [id], onDelete: Cascade)
  influencerId    String?     @map("influencer_id") @db.Uuid
  influencer      Influencer? @relation(fields: [influencerId], references: [id])
  platform        String
  postType        String?     @map("post_type")
  postUrl         String      @map("post_url")
  postId          String?     @map("post_id")
  content         String?
  authorUsername  String?     @map("author_username")
  authorFollowers Int         @default(0) @map("author_followers")
  likes           Int         @default(0)
  retweets        Int         @default(0)
  replies         Int         @default(0)
  isRecommendation Boolean    @default(false) @map("is_recommendation")
  isComparison    Boolean     @default(false) @map("is_comparison")
  comparedTo      String[]    @default([]) @map("compared_to")
  sentiment       String?
  postedAt        DateTime?   @map("posted_at") @db.Timestamptz
  scrapedAt       DateTime    @default(now()) @map("scraped_at") @db.Timestamptz

  @@unique([platform, postUrl])
  @@map("social_mentions")
}

model UnknownMention {
  id              String      @id @default(uuid()) @db.Uuid
  toolName        String      @map("tool_name")
  normalizedName  String?     @map("normalized_name")
  platform        String
  postUrl         String      @map("post_url")
  mentionedBy     String?     @map("mentioned_by")
  influencerId    String?     @map("influencer_id") @db.Uuid
  influencer      Influencer? @relation(fields: [influencerId], references: [id])
  contextSnippet  String?     @map("context_snippet")
  confidenceScore Float?      @map("confidence_score")
  status          String      @default("pending")
  resolvedToolId  String?     @map("resolved_tool_id") @db.Uuid
  discoveredAt    DateTime    @default(now()) @map("discovered_at") @db.Timestamptz

  @@unique([normalizedName, postUrl])
  @@map("unknown_mentions")
}

model DiscoveryQueue {
  id              String    @id @default(uuid()) @db.Uuid
  repoUrl         String?   @unique @map("repo_url")
  toolName        String?   @map("tool_name")
  source          DiscoverySource
  sourceUrl       String?   @map("source_url")
  discoveredBy    String?   @map("discovered_by")
  stars           Int       @default(0)
  socialMentions  Int       @default(0) @map("social_mentions")
  status          String    @default("pending")
  rejectionReason String?   @map("rejection_reason")
  queuedAt        DateTime  @default(now()) @map("queued_at") @db.Timestamptz
  processedAt     DateTime? @map("processed_at") @db.Timestamptz

  @@map("discovery_queue")
}

model MetricsHistory {
  id             String   @id @default(uuid()) @db.Uuid
  toolId         String   @map("tool_id") @db.Uuid
  tool           Tool     @relation(fields: [toolId], references: [id], onDelete: Cascade)
  recordedDate   DateTime @default(now()) @map("recorded_date") @db.Date
  stars          Int?
  compositeScore Float?   @map("composite_score")

  @@unique([toolId, recordedDate])
  @@map("metrics_history")
}

// New tables for user engagement

model Rating {
  id        String   @id @default(uuid()) @db.Uuid
  toolId    String   @map("tool_id") @db.Uuid
  tool      Tool     @relation(fields: [toolId], references: [id], onDelete: Cascade)
  sessionId String   @map("session_id")
  rating    Int
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz

  @@unique([toolId, sessionId])
  @@map("ratings")
}

model Comment {
  id        String   @id @default(uuid()) @db.Uuid
  toolId    String   @map("tool_id") @db.Uuid
  tool      Tool     @relation(fields: [toolId], references: [id], onDelete: Cascade)
  sessionId String   @map("session_id")
  author    String?
  content   String
  status    String   @default("pending")
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz

  @@map("comments")
}

model Favorite {
  id        String   @id @default(uuid()) @db.Uuid
  toolId    String   @map("tool_id") @db.Uuid
  tool      Tool     @relation(fields: [toolId], references: [id], onDelete: Cascade)
  sessionId String   @map("session_id")
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz

  @@unique([toolId, sessionId])
  @@map("favorites")
}
```

---

## File: next.config.js

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig
```

---

## File: tailwind.config.js

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef7ee',
          100: '#fdedd3',
          200: '#fad7a5',
          300: '#f6ba6d',
          400: '#f19333',
          500: '#ee7712',
          600: '#df5c08',
          700: '#b94409',
          800: '#93360f',
          900: '#772f10',
        },
      },
    },
  },
  plugins: [],
}
```

---

## File: postcss.config.js

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

---

## File: tsconfig.json

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

## File: .env.local.example

```
DATABASE_URL="postgresql://user:@localhost:5432/skill_of_skills"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## File: src/lib/prisma.ts

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

---

## File: src/lib/utils.ts

```typescript
import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}

export function getToolTypeIcon(type: string): string {
  const icons: Record<string, string> = {
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
  return icons[type] || '📄'
}

export function getRiskColor(level: string): string {
  const colors: Record<string, string> = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
    critical: 'bg-gray-900 text-white',
  }
  return colors[level] || colors.low
}

export function getCategoryIcon(slug: string): string {
  const icons: Record<string, string> = {
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
  return icons[slug] || '📦'
}
```

---

## File: src/types/index.ts

```typescript
export interface Tool {
  id: string
  name: string
  slug: string
  repoUrl: string | null
  repoOwner: string | null
  repoName: string | null
  toolType: string
  categoryId: string | null
  category: Category | null
  tags: string[]
  description: string | null
  installCommand: string | null
  hasSkillMd: boolean
  hasClaudePlugin: boolean
  hasMcpJson: boolean
  riskLevel: string
  riskReasons: string[]
  validationStatus: string
  stars: number
  forks: number
  license: string | null
  xMentionCount: number
  xRecommendationCount: number
  redditMentionCount: number
  githubScore: number
  socialScore: number
  compositeScore: number
  trendingScore: number
  isActive: boolean
  isOfficial: boolean
  isVerified: boolean
  discoveredAt: Date
  updatedAt: Date
  averageRating?: number
  ratingCount?: number
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  displayOrder: number
  _count?: { tools: number }
}

export interface SearchFilters {
  type?: string
  category?: string
  risk?: string
  sort?: 'score' | 'stars' | 'trending' | 'recent'
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface Stats {
  totalTools: number
  totalCategories: number
  totalStars: number
  toolsByType: { type: string; count: number }[]
  toolsByCategory: { category: string; count: number }[]
  recentlyAdded: Tool[]
}
```

---

## File: src/lib/queries/tools.ts

```typescript
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
```

---

## File: src/lib/queries/categories.ts

```typescript
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
```

---

## File: src/lib/queries/search.ts

```typescript
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
```

---

## File: src/lib/queries/stats.ts

```typescript
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
```

---

## File: src/app/globals.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground: 15 23 42;
  --background: 255 255 255;
}

body {
  color: rgb(var(--foreground));
  background: rgb(var(--background));
}
```

---

## File: src/app/layout.tsx

```tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Skill of Skills - Claude Code Directory',
  description: 'Curated directory of Claude Code skills, plugins, and MCP servers',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  )
}
```

---

## File: src/components/layout/Header.tsx

```tsx
import Link from 'next/link'
import { Navigation } from './Navigation'

export function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            <span className="text-xl font-bold text-gray-900">Skill of Skills</span>
          </Link>
          <Navigation />
        </div>
      </div>
    </header>
  )
}
```

---

## File: src/components/layout/Navigation.tsx

```tsx
import Link from 'next/link'

const navItems = [
  { href: '/tools', label: 'Browse' },
  { href: '/categories', label: 'Categories' },
  { href: '/search', label: 'Search' },
  { href: '/submit', label: 'Submit' },
  { href: '/analytics', label: 'Stats' },
]

export function Navigation() {
  return (
    <nav className="flex items-center gap-6">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  )
}
```

---

## File: src/components/layout/Footer.tsx

```tsx
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Skill of Skills. Open source directory.
          </p>
          <div className="flex gap-4">
            <Link href="https://github.com/911fund/skill-of-skills" className="text-sm text-gray-500 hover:text-gray-700">
              GitHub
            </Link>
            <Link href="/api/v1/tools" className="text-sm text-gray-500 hover:text-gray-700">
              API
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
```

---

## File: src/components/ui/Button.tsx

```tsx
import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
          'disabled:pointer-events-none disabled:opacity-50',
          {
            'bg-primary-600 text-white hover:bg-primary-700': variant === 'primary',
            'bg-gray-100 text-gray-900 hover:bg-gray-200': variant === 'secondary',
            'border border-gray-300 bg-white hover:bg-gray-50': variant === 'outline',
            'h-8 px-3 text-sm': size === 'sm',
            'h-10 px-4 text-sm': size === 'md',
            'h-12 px-6 text-base': size === 'lg',
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'
```

---

## File: src/components/ui/Input.tsx

```tsx
import { cn } from '@/lib/utils'
import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm',
          'placeholder:text-gray-400',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:border-transparent',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'
```

---

## File: src/components/ui/Select.tsx

```tsx
import { cn } from '@/lib/utils'
import { SelectHTMLAttributes, forwardRef } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      >
        {children}
      </select>
    )
  }
)
Select.displayName = 'Select'
```

---

## File: src/components/ui/Badge.tsx

```tsx
import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger'
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        {
          'bg-gray-100 text-gray-800': variant === 'default',
          'bg-green-100 text-green-800': variant === 'success',
          'bg-yellow-100 text-yellow-800': variant === 'warning',
          'bg-red-100 text-red-800': variant === 'danger',
        },
        className
      )}
    >
      {children}
    </span>
  )
}
```

---

## File: src/components/ui/Card.tsx

```tsx
import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={cn('rounded-lg border border-gray-200 bg-white p-6 shadow-sm', className)}>
      {children}
    </div>
  )
}
```

---

## File: src/components/ui/Pagination.tsx

```tsx
'use client'

import { Button } from './Button'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
      >
        Previous
      </Button>
      <span className="text-sm text-gray-600">
        Page {page} of {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
      >
        Next
      </Button>
    </div>
  )
}
```

---

## File: src/components/tools/ToolCard.tsx

```tsx
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { RiskBadge } from './RiskBadge'
import { TypeBadge } from './TypeBadge'
import { formatNumber, getCategoryIcon } from '@/lib/utils'
import type { Tool } from '@/types'

interface ToolCardProps {
  tool: Tool
}

export function ToolCard({ tool }: ToolCardProps) {
  return (
    <Link href={`/tools/${tool.slug}`}>
      <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <TypeBadge type={tool.toolType} />
            {tool.isOfficial && <Badge variant="success">Official</Badge>}
            {tool.isVerified && <Badge variant="default">Verified</Badge>}
          </div>
          <RiskBadge level={tool.riskLevel} />
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2">{tool.name}</h3>

        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {tool.description || 'No description available'}
        </p>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-3">
            <span>⭐ {formatNumber(tool.stars)}</span>
            {tool.category && (
              <span>
                {getCategoryIcon(tool.category.slug)} {tool.category.name}
              </span>
            )}
          </div>
          <span className="text-xs">Score: {tool.compositeScore.toFixed(1)}</span>
        </div>
      </Card>
    </Link>
  )
}
```

---

## File: src/components/tools/ToolGrid.tsx

```tsx
import { ToolCard } from './ToolCard'
import type { Tool } from '@/types'

interface ToolGridProps {
  tools: Tool[]
}

export function ToolGrid({ tools }: ToolGridProps) {
  if (tools.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No tools found</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tools.map((tool) => (
        <ToolCard key={tool.id} tool={tool} />
      ))}
    </div>
  )
}
```

---

## File: src/components/tools/TypeBadge.tsx

```tsx
import { Badge } from '@/components/ui/Badge'
import { getToolTypeIcon } from '@/lib/utils'

interface TypeBadgeProps {
  type: string
}

export function TypeBadge({ type }: TypeBadgeProps) {
  const icon = getToolTypeIcon(type)
  const label = type.replace('_', ' ')

  return (
    <Badge>
      {icon} {label}
    </Badge>
  )
}
```

---

## File: src/components/tools/RiskBadge.tsx

```tsx
import { Badge } from '@/components/ui/Badge'

interface RiskBadgeProps {
  level: string
}

export function RiskBadge({ level }: RiskBadgeProps) {
  const variants: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
    low: 'success',
    medium: 'warning',
    high: 'danger',
    critical: 'danger',
  }

  const icons: Record<string, string> = {
    low: '🟢',
    medium: '🟡',
    high: '🔴',
    critical: '⚫',
  }

  return (
    <Badge variant={variants[level] || 'default'}>
      {icons[level]} {level}
    </Badge>
  )
}
```

---

## File: src/components/tools/InstallCommand.tsx

```tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'

interface InstallCommandProps {
  command: string | null
}

export function InstallCommand({ command }: InstallCommandProps) {
  const [copied, setCopied] = useState(false)

  if (!command) return null

  const handleCopy = async () => {
    await navigator.clipboard.writeText(command)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-2 bg-gray-900 rounded-lg p-3">
      <code className="flex-1 text-sm text-green-400 font-mono">{command}</code>
      <Button size="sm" variant="secondary" onClick={handleCopy}>
        {copied ? 'Copied!' : 'Copy'}
      </Button>
    </div>
  )
}
```

---

## File: src/components/tools/ToolDetail.tsx

```tsx
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { RiskBadge } from './RiskBadge'
import { TypeBadge } from './TypeBadge'
import { InstallCommand } from './InstallCommand'
import { RatingStars } from '@/components/engagement/RatingStars'
import { FavoriteButton } from '@/components/engagement/FavoriteButton'
import { formatNumber, getCategoryIcon } from '@/lib/utils'
import type { Tool } from '@/types'

interface ToolDetailProps {
  tool: Tool
}

export function ToolDetail({ tool }: ToolDetailProps) {
  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TypeBadge type={tool.toolType} />
              {tool.isOfficial && <Badge variant="success">Official</Badge>}
              {tool.isVerified && <Badge variant="default">Verified</Badge>}
              <RiskBadge level={tool.riskLevel} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{tool.name}</h1>
          </div>
          <FavoriteButton toolId={tool.id} />
        </div>

        <p className="text-gray-600 mb-6">{tool.description || 'No description available'}</p>

        <InstallCommand command={tool.installCommand} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
          <div>
            <p className="text-sm text-gray-500">Stars</p>
            <p className="text-xl font-semibold">⭐ {formatNumber(tool.stars)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Category</p>
            <p className="text-xl font-semibold">
              {tool.category ? `${getCategoryIcon(tool.category.slug)} ${tool.category.name}` : 'Uncategorized'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Score</p>
            <p className="text-xl font-semibold">{tool.compositeScore.toFixed(1)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Rating</p>
            <RatingStars toolId={tool.id} initialRating={tool.averageRating || 0} count={tool.ratingCount || 0} />
          </div>
        </div>

        {tool.repoUrl && (
          <div className="mt-6 pt-6 border-t">
            <Button asChild>
              <a href={tool.repoUrl} target="_blank" rel="noopener noreferrer">
                View on GitHub →
              </a>
            </Button>
          </div>
        )}
      </Card>

      {tool.riskReasons && tool.riskReasons.length > 0 && (
        <Card>
          <h2 className="text-lg font-semibold mb-3">Risk Assessment</h2>
          <ul className="space-y-2">
            {tool.riskReasons.map((reason, i) => (
              <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                <span>⚠️</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}
```

---

## File: src/components/search/SearchBar.tsx

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

interface SearchBarProps {
  initialQuery?: string
}

export function SearchBar({ initialQuery = '' }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery)
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="search"
        placeholder="Search skills, plugins, MCP servers..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="flex-1"
      />
      <Button type="submit">Search</Button>
    </form>
  )
}
```

---

## File: src/components/search/SearchFilters.tsx

```tsx
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Select } from '@/components/ui/Select'

const types = [
  { value: '', label: 'All Types' },
  { value: 'skill', label: 'Skills' },
  { value: 'plugin', label: 'Plugins' },
  { value: 'collection', label: 'Collections' },
  { value: 'cli_tool', label: 'CLI Tools' },
  { value: 'mcp_server', label: 'MCP Servers' },
]

const sorts = [
  { value: 'score', label: 'Best Match' },
  { value: 'stars', label: 'Most Stars' },
  { value: 'trending', label: 'Trending' },
  { value: 'recent', label: 'Recently Added' },
]

export function SearchFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex gap-4">
      <Select
        value={searchParams.get('type') || ''}
        onChange={(e) => updateFilter('type', e.target.value)}
      >
        {types.map((t) => (
          <option key={t.value} value={t.value}>{t.label}</option>
        ))}
      </Select>
      <Select
        value={searchParams.get('sort') || 'score'}
        onChange={(e) => updateFilter('sort', e.target.value)}
      >
        {sorts.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </Select>
    </div>
  )
}
```

---

## File: src/components/search/SearchResults.tsx

```tsx
import { ToolGrid } from '@/components/tools/ToolGrid'
import type { Tool } from '@/types'

interface SearchResultsProps {
  tools: Tool[]
  query: string
}

export function SearchResults({ tools, query }: SearchResultsProps) {
  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">
        {tools.length} result{tools.length !== 1 ? 's' : ''} for "{query}"
      </p>
      <ToolGrid tools={tools} />
    </div>
  )
}
```

---

## File: src/components/engagement/RatingStars.tsx

```tsx
'use client'

import { useState } from 'react'

interface RatingStarsProps {
  toolId: string
  initialRating: number
  count: number
}

export function RatingStars({ toolId, initialRating, count }: RatingStarsProps) {
  const [rating, setRating] = useState(initialRating)
  const [hover, setHover] = useState(0)
  const [hasRated, setHasRated] = useState(false)

  const handleRate = async (value: number) => {
    const sessionId = localStorage.getItem('sessionId') || crypto.randomUUID()
    localStorage.setItem('sessionId', sessionId)

    try {
      await fetch('/api/v1/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolId, rating: value, sessionId }),
      })
      setRating(value)
      setHasRated(true)
    } catch (error) {
      console.error('Failed to rate:', error)
    }
  }

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => handleRate(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="text-xl focus:outline-none"
          disabled={hasRated}
        >
          {star <= (hover || rating) ? '★' : '☆'}
        </button>
      ))}
      <span className="text-sm text-gray-500 ml-2">
        ({count} rating{count !== 1 ? 's' : ''})
      </span>
    </div>
  )
}
```

---

## File: src/components/engagement/FavoriteButton.tsx

```tsx
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'

interface FavoriteButtonProps {
  toolId: string
}

export function FavoriteButton({ toolId }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
    setIsFavorite(favorites.includes(toolId))
  }, [toolId])

  const toggleFavorite = async () => {
    const sessionId = localStorage.getItem('sessionId') || crypto.randomUUID()
    localStorage.setItem('sessionId', sessionId)

    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
    const newFavorites = isFavorite
      ? favorites.filter((id: string) => id !== toolId)
      : [...favorites, toolId]

    localStorage.setItem('favorites', JSON.stringify(newFavorites))
    setIsFavorite(!isFavorite)

    try {
      await fetch('/api/v1/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolId, sessionId, action: isFavorite ? 'remove' : 'add' }),
      })
    } catch (error) {
      console.error('Failed to sync favorite:', error)
    }
  }

  return (
    <Button variant="outline" onClick={toggleFavorite}>
      {isFavorite ? '❤️ Favorited' : '🤍 Favorite'}
    </Button>
  )
}
```

---

## File: src/components/engagement/CommentSection.tsx

```tsx
'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

interface Comment {
  id: string
  author: string | null
  content: string
  createdAt: string
}

interface CommentSectionProps {
  toolId: string
  comments: Comment[]
}

export function CommentSection({ toolId, comments: initialComments }: CommentSectionProps) {
  const [comments, setComments] = useState(initialComments)
  const [newComment, setNewComment] = useState('')
  const [author, setAuthor] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setSubmitting(true)
    const sessionId = localStorage.getItem('sessionId') || crypto.randomUUID()
    localStorage.setItem('sessionId', sessionId)

    try {
      const res = await fetch('/api/v1/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolId, content: newComment, author: author || null, sessionId }),
      })
      if (res.ok) {
        setNewComment('')
        setAuthor('')
      }
    } catch (error) {
      console.error('Failed to submit comment:', error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <h2 className="text-lg font-semibold mb-4">Comments</h2>

      <form onSubmit={handleSubmit} className="space-y-3 mb-6">
        <Input
          placeholder="Your name (optional)"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
        />
        <Input
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <Button type="submit" disabled={submitting || !newComment.trim()}>
          {submitting ? 'Submitting...' : 'Submit'}
        </Button>
        <p className="text-xs text-gray-500">Comments are moderated before appearing.</p>
      </form>

      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-gray-500 text-sm">No comments yet. Be the first!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="border-b pb-3">
              <p className="text-sm font-medium">{comment.author || 'Anonymous'}</p>
              <p className="text-gray-600">{comment.content}</p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(comment.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}
```

---

## File: src/components/analytics/StatsCard.tsx

```tsx
import { Card } from '@/components/ui/Card'

interface StatsCardProps {
  title: string
  value: string | number
  icon: string
}

export function StatsCard({ title, value, icon }: StatsCardProps) {
  return (
    <Card>
      <div className="flex items-center gap-4">
        <span className="text-4xl">{icon}</span>
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </Card>
  )
}
```

---

## File: src/components/analytics/TypeDistribution.tsx

```tsx
import { Card } from '@/components/ui/Card'
import { getToolTypeIcon } from '@/lib/utils'

interface TypeDistributionProps {
  data: { type: string; count: number }[]
}

export function TypeDistribution({ data }: TypeDistributionProps) {
  const total = data.reduce((sum, d) => sum + d.count, 0)

  return (
    <Card>
      <h2 className="text-lg font-semibold mb-4">Tools by Type</h2>
      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.type} className="flex items-center gap-3">
            <span className="text-xl">{getToolTypeIcon(item.type)}</span>
            <div className="flex-1">
              <div className="flex justify-between text-sm">
                <span className="capitalize">{item.type.replace('_', ' ')}</span>
                <span className="text-gray-500">{item.count}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full mt-1">
                <div
                  className="h-full bg-primary-500 rounded-full"
                  style={{ width: `${(item.count / total) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
```

---

## File: src/components/analytics/TrendChart.tsx

```tsx
import { Card } from '@/components/ui/Card'
import type { Tool } from '@/types'

interface TrendChartProps {
  tools: Tool[]
}

export function TrendChart({ tools }: TrendChartProps) {
  return (
    <Card>
      <h2 className="text-lg font-semibold mb-4">Recently Added</h2>
      <div className="space-y-3">
        {tools.map((tool) => (
          <div key={tool.id} className="flex items-center justify-between py-2 border-b last:border-0">
            <div>
              <p className="font-medium">{tool.name}</p>
              <p className="text-sm text-gray-500">{tool.category?.name || 'Uncategorized'}</p>
            </div>
            <p className="text-sm text-gray-400">
              {new Date(tool.discoveredAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </Card>
  )
}
```

---

## File: src/app/page.tsx

```tsx
import { SearchBar } from '@/components/search/SearchBar'
import { ToolGrid } from '@/components/tools/ToolGrid'
import { getTrendingTools, getTools } from '@/lib/queries/tools'
import { getCategories } from '@/lib/queries/categories'
import Link from 'next/link'
import { getCategoryIcon } from '@/lib/utils'

export default async function HomePage() {
  const [trending, recent, categories] = await Promise.all([
    getTrendingTools(6),
    getTools({ sort: 'recent' }, 1, 6),
    getCategories(),
  ])

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🎯 Skill of Skills
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Curated directory of Claude Code skills, plugins, and MCP servers
        </p>
        <div className="max-w-2xl mx-auto">
          <SearchBar />
        </div>
      </div>

      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">🔥 Trending</h2>
          <Link href="/tools?sort=trending" className="text-primary-600 hover:text-primary-700">
            View all →
          </Link>
        </div>
        <ToolGrid tools={trending} />
      </section>

      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">🆕 Recently Added</h2>
          <Link href="/tools?sort=recent" className="text-primary-600 hover:text-primary-700">
            View all →
          </Link>
        </div>
        <ToolGrid tools={recent.data} />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6">📂 Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="p-4 rounded-lg border border-gray-200 hover:border-primary-500 hover:shadow-sm transition-all text-center"
            >
              <span className="text-2xl">{getCategoryIcon(cat.slug)}</span>
              <p className="font-medium mt-2">{cat.name}</p>
              <p className="text-sm text-gray-500">{cat._count?.tools || 0} tools</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
```

---

## File: src/app/tools/page.tsx

```tsx
import { Suspense } from 'react'
import { ToolGrid } from '@/components/tools/ToolGrid'
import { SearchFilters } from '@/components/search/SearchFilters'
import { Pagination } from '@/components/ui/Pagination'
import { getTools } from '@/lib/queries/tools'

interface Props {
  searchParams: { type?: string; sort?: string; page?: string }
}

export default async function ToolsPage({ searchParams }: Props) {
  const page = parseInt(searchParams.page || '1')
  const result = await getTools(
    { type: searchParams.type, sort: searchParams.sort as any },
    page,
    18
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Browse Tools</h1>
        <Suspense fallback={null}>
          <SearchFilters />
        </Suspense>
      </div>

      <ToolGrid tools={result.data} />

      {result.totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            onPageChange={() => {}}
          />
        </div>
      )}
    </div>
  )
}
```

---

## File: src/app/tools/[slug]/page.tsx

```tsx
import { notFound } from 'next/navigation'
import { ToolDetail } from '@/components/tools/ToolDetail'
import { CommentSection } from '@/components/engagement/CommentSection'
import { getToolBySlug } from '@/lib/queries/tools'

interface Props {
  params: { slug: string }
}

export default async function ToolPage({ params }: Props) {
  const tool = await getToolBySlug(params.slug)

  if (!tool) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <ToolDetail tool={tool} />
      <div className="mt-8">
        <CommentSection toolId={tool.id} comments={[]} />
      </div>
    </div>
  )
}
```

---

## File: src/app/categories/page.tsx

```tsx
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { getCategories } from '@/lib/queries/categories'
import { getCategoryIcon } from '@/lib/utils'

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8">Categories</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <Link key={cat.id} href={`/categories/${cat.slug}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <span className="text-4xl">{getCategoryIcon(cat.slug)}</span>
                <div>
                  <h2 className="text-xl font-semibold">{cat.name}</h2>
                  <p className="text-gray-500">{cat._count?.tools || 0} tools</p>
                </div>
              </div>
              {cat.description && (
                <p className="mt-3 text-sm text-gray-600">{cat.description}</p>
              )}
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
```

---

## File: src/app/categories/[slug]/page.tsx

```tsx
import { notFound } from 'next/navigation'
import { ToolGrid } from '@/components/tools/ToolGrid'
import { getCategoryBySlug } from '@/lib/queries/categories'
import { getTools } from '@/lib/queries/tools'
import { getCategoryIcon } from '@/lib/utils'

interface Props {
  params: { slug: string }
}

export default async function CategoryPage({ params }: Props) {
  const [category, tools] = await Promise.all([
    getCategoryBySlug(params.slug),
    getTools({ category: params.slug }, 1, 50),
  ])

  if (!category) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">{getCategoryIcon(category.slug)}</span>
          <h1 className="text-3xl font-bold">{category.name}</h1>
        </div>
        {category.description && (
          <p className="text-gray-600">{category.description}</p>
        )}
        <p className="text-sm text-gray-500 mt-2">{tools.total} tools</p>
      </div>

      <ToolGrid tools={tools.data} />
    </div>
  )
}
```

---

## File: src/app/search/page.tsx

```tsx
import { SearchBar } from '@/components/search/SearchBar'
import { SearchResults } from '@/components/search/SearchResults'
import { searchTools } from '@/lib/queries/search'

interface Props {
  searchParams: { q?: string }
}

export default async function SearchPage({ searchParams }: Props) {
  const query = searchParams.q || ''
  const tools = query ? await searchTools(query) : []

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-6">Search</h1>

      <div className="mb-8">
        <SearchBar initialQuery={query} />
      </div>

      {query ? (
        <SearchResults tools={tools} query={query} />
      ) : (
        <p className="text-gray-500 text-center py-12">
          Enter a search term to find skills, plugins, and MCP servers
        </p>
      )}
    </div>
  )
}
```

---

## File: src/app/submit/page.tsx

```tsx
'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'

export default function SubmitPage() {
  const [formData, setFormData] = useState({
    repoUrl: '',
    name: '',
    description: '',
    toolType: 'skill',
  })
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage('')

    try {
      const res = await fetch('/api/v1/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (res.ok) {
        setMessage('Tool submitted successfully! It will be reviewed shortly.')
        setFormData({ repoUrl: '', name: '', description: '', toolType: 'skill' })
      } else {
        setMessage(data.error || 'Submission failed')
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-2">Submit a Tool</h1>
      <p className="text-gray-600 mb-8">
        Know a great Claude Code skill, plugin, or MCP server? Submit it here!
      </p>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">GitHub Repository URL *</label>
            <Input
              type="url"
              placeholder="https://github.com/owner/repo"
              value={formData.repoUrl}
              onChange={(e) => setFormData({ ...formData, repoUrl: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tool Name *</label>
            <Input
              placeholder="My Awesome Skill"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Input
              placeholder="Brief description of what it does"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tool Type *</label>
            <Select
              value={formData.toolType}
              onChange={(e) => setFormData({ ...formData, toolType: e.target.value })}
            >
              <option value="skill">Skill</option>
              <option value="plugin">Plugin</option>
              <option value="collection">Collection</option>
              <option value="cli_tool">CLI Tool</option>
              <option value="mcp_server">MCP Server</option>
              <option value="prompt_pack">Prompt Pack</option>
              <option value="workflow">Workflow</option>
              <option value="extension">Extension</option>
              <option value="resource">Resource</option>
            </Select>
          </div>

          {message && (
            <p className={`text-sm ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </p>
          )}

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? 'Submitting...' : 'Submit Tool'}
          </Button>
        </form>
      </Card>
    </div>
  )
}
```

---

## File: src/app/analytics/page.tsx

```tsx
import { StatsCard } from '@/components/analytics/StatsCard'
import { TypeDistribution } from '@/components/analytics/TypeDistribution'
import { TrendChart } from '@/components/analytics/TrendChart'
import { getStats } from '@/lib/queries/stats'
import { formatNumber } from '@/lib/utils'

export default async function AnalyticsPage() {
  const stats = await getStats()

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8">Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard title="Total Tools" value={stats.totalTools} icon="🎯" />
        <StatsCard title="Categories" value={stats.totalCategories} icon="📂" />
        <StatsCard title="Total Stars" value={formatNumber(stats.totalStars)} icon="⭐" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <TypeDistribution data={stats.toolsByType} />
        <TrendChart tools={stats.recentlyAdded} />
      </div>
    </div>
  )
}
```

---

## File: src/app/api/v1/tools/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getTools } from '@/lib/queries/tools'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const type = searchParams.get('type') || undefined
  const category = searchParams.get('category') || undefined
  const sort = (searchParams.get('sort') as any) || 'score'
  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = parseInt(searchParams.get('limit') || '20')

  try {
    const result = await getTools({ type, category, sort }, page, pageSize)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tools' }, { status: 500 })
  }
}
```

---

## File: src/app/api/v1/tools/[slug]/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getToolBySlug } from '@/lib/queries/tools'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const tool = await getToolBySlug(params.slug)

    if (!tool) {
      return NextResponse.json({ error: 'Tool not found' }, { status: 404 })
    }

    return NextResponse.json(tool)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tool' }, { status: 500 })
  }
}
```

---

## File: src/app/api/v1/tools/trending/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getTrendingTools } from '@/lib/queries/tools'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '10')

  try {
    const tools = await getTrendingTools(limit)
    return NextResponse.json(tools)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch trending tools' }, { status: 500 })
  }
}
```

---

## File: src/app/api/v1/categories/route.ts

```typescript
import { NextResponse } from 'next/server'
import { getCategories } from '@/lib/queries/categories'

export async function GET() {
  try {
    const categories = await getCategories()
    return NextResponse.json(categories)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}
```

---

## File: src/app/api/v1/categories/[slug]/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getCategoryBySlug } from '@/lib/queries/categories'
import { getTools } from '@/lib/queries/tools'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const [category, tools] = await Promise.all([
      getCategoryBySlug(params.slug),
      getTools({ category: params.slug }, 1, 100),
    ])

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    return NextResponse.json({ category, tools: tools.data })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch category' }, { status: 500 })
  }
}
```

---

## File: src/app/api/v1/search/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { searchTools } from '@/lib/queries/search'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')

  if (!query) {
    return NextResponse.json({ error: 'Query parameter required' }, { status: 400 })
  }

  try {
    const tools = await searchTools(query)
    return NextResponse.json(tools)
  } catch (error) {
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
```

---

## File: src/app/api/v1/submit/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { repoUrl, name, description, toolType } = body

    if (!repoUrl || !name) {
      return NextResponse.json({ error: 'repoUrl and name are required' }, { status: 400 })
    }

    // Check for duplicates
    const existing = await prisma.discoveryQueue.findFirst({
      where: { repoUrl },
    })

    if (existing) {
      return NextResponse.json({ error: 'This tool has already been submitted' }, { status: 409 })
    }

    // Add to discovery queue
    const submission = await prisma.discoveryQueue.create({
      data: {
        repoUrl,
        toolName: name,
        source: 'manual_submission',
        discoveredBy: 'web_form',
        status: 'pending',
      },
    })

    return NextResponse.json({ success: true, id: submission.id })
  } catch (error) {
    return NextResponse.json({ error: 'Submission failed' }, { status: 500 })
  }
}
```

---

## File: src/app/api/v1/stats/route.ts

```typescript
import { NextResponse } from 'next/server'
import { getStats } from '@/lib/queries/stats'

export async function GET() {
  try {
    const stats = await getStats()
    return NextResponse.json(stats)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
```

---

## File: src/app/api/v1/ratings/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { toolId, rating, sessionId } = body

    if (!toolId || !rating || !sessionId) {
      return NextResponse.json({ error: 'toolId, rating, and sessionId required' }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be 1-5' }, { status: 400 })
    }

    const result = await prisma.rating.upsert({
      where: { toolId_sessionId: { toolId, sessionId } },
      update: { rating },
      create: { toolId, sessionId, rating },
    })

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save rating' }, { status: 500 })
  }
}
```

---

## File: src/app/api/v1/favorites/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('sessionId')

  if (!sessionId) {
    return NextResponse.json({ error: 'sessionId required' }, { status: 400 })
  }

  try {
    const favorites = await prisma.favorite.findMany({
      where: { sessionId },
      include: { tool: { include: { category: true } } },
    })

    return NextResponse.json(favorites.map((f) => f.tool))
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { toolId, sessionId, action } = body

    if (!toolId || !sessionId) {
      return NextResponse.json({ error: 'toolId and sessionId required' }, { status: 400 })
    }

    if (action === 'remove') {
      await prisma.favorite.deleteMany({
        where: { toolId, sessionId },
      })
    } else {
      await prisma.favorite.upsert({
        where: { toolId_sessionId: { toolId, sessionId } },
        update: {},
        create: { toolId, sessionId },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update favorite' }, { status: 500 })
  }
}
```

---

## File: src/app/api/v1/comments/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const toolId = searchParams.get('toolId')

  if (!toolId) {
    return NextResponse.json({ error: 'toolId required' }, { status: 400 })
  }

  try {
    const comments = await prisma.comment.findMany({
      where: { toolId, status: 'approved' },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(comments)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { toolId, content, author, sessionId } = body

    if (!toolId || !content || !sessionId) {
      return NextResponse.json({ error: 'toolId, content, and sessionId required' }, { status: 400 })
    }

    const comment = await prisma.comment.create({
      data: {
        toolId,
        sessionId,
        author: author || null,
        content,
        status: 'pending',
      },
    })

    return NextResponse.json(comment)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save comment' }, { status: 500 })
  }
}
```

---

## Docker Integration

### File: docker/Dockerfile.web

```dockerfile
FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY web/package*.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY web .
RUN npx prisma generate
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]
```

### Updated docker/docker-compose.yml

Add this service to the existing docker-compose.yml:

```yaml
  web:
    build:
      context: ..
      dockerfile: docker/Dockerfile.web
    container_name: skill-of-skills-web
    restart: unless-stopped
    ports:
      - "${WEB_PORT:-3000}:3000"
    environment:
      - DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}
      - NEXT_PUBLIC_APP_URL=${APP_URL:-http://localhost:3000}
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - skill-network
```

### Updated docker/.env.example

Add these lines:

```
# Web App
WEB_PORT=3000
APP_URL=http://localhost:3000
```

---

## Database Migration for User Engagement

Run this SQL to add the new tables (ratings, comments, favorites):

```sql
-- User engagement tables
CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_id UUID REFERENCES tools(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tool_id, session_id)
);

CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_id UUID REFERENCES tools(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  author TEXT,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_id UUID REFERENCES tools(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tool_id, session_id)
);

CREATE INDEX idx_ratings_tool ON ratings(tool_id);
CREATE INDEX idx_comments_tool ON comments(tool_id) WHERE status = 'approved';
CREATE INDEX idx_favorites_session ON favorites(session_id);
```

---

## Verification Checklist

After implementation:

1. **Setup**
   - [ ] `cd skill-of-skills/web && npm install`
   - [ ] Copy `.env.local.example` to `.env.local` and configure DATABASE_URL
   - [ ] `npx prisma generate`
   - [ ] `npx prisma db push` (or run migration SQL)

2. **Development**
   - [ ] `npm run dev` starts without errors
   - [ ] Homepage loads at http://localhost:3000
   - [ ] Trending tools display correctly
   - [ ] Categories show with tool counts

3. **Search**
   - [ ] `/search?q=marketing` returns results
   - [ ] Full-text search uses existing tsvector index
   - [ ] Filters work (type, sort)

4. **Tool Details**
   - [ ] `/tools/marketing-skills` loads tool detail
   - [ ] Install command displays and copies
   - [ ] Risk badge shows correct color

5. **Submission**
   - [ ] Submit form at `/submit` works
   - [ ] Duplicate detection prevents re-submission
   - [ ] Submission added to discovery_queue

6. **User Engagement**
   - [ ] Rating stars work (1-5)
   - [ ] Favorite button toggles
   - [ ] Comments submit (pending moderation)

7. **API**
   - [ ] `curl http://localhost:3000/api/v1/tools` returns JSON
   - [ ] `curl http://localhost:3000/api/v1/search?q=code` returns results
   - [ ] All API routes return proper status codes

8. **Docker**
   - [ ] `docker-compose up -d` starts all services
   - [ ] Web container connects to postgres
   - [ ] Health checks pass

---

## Summary

This PRD provides complete specifications for building the Skill of Skills web application:

- **40+ files** fully specified with complete code
- **Prisma schema** matching existing PostgreSQL structure
- **9 API routes** with full CRUD operations
- **8 pages** with server components
- **20+ React components** with Tailwind styling
- **User engagement** features (ratings, comments, favorites)
- **Docker integration** with the existing setup
- **Full-text search** using existing tsvector indexes

The implementation follows Next.js 14 App Router patterns with TypeScript throughout.
