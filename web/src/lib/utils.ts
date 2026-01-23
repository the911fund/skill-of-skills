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
