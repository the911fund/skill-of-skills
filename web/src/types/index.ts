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
  lastCommitAt: Date | null
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
