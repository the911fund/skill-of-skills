export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ToolDetail } from '@/components/tools/ToolDetail'
import { getToolBySlug } from '@/lib/queries/tools'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tool = await getToolBySlug(params.slug)

  if (!tool) {
    return {
      title: 'Tool Not Found',
    }
  }

  const description = tool.description || `${tool.name} - A ${tool.toolType} for Claude Code`

  return {
    title: tool.name,
    description,
    openGraph: {
      title: `${tool.name} - Skill of Skills`,
      description,
      url: `https://skills.911fund.io/tools/${params.slug}`,
      images: ['/og-image.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${tool.name} - Skill of Skills`,
      description,
      images: ['/og-image.png'],
    },
  }
}

export default async function ToolPage({ params }: Props) {
  const tool = await getToolBySlug(params.slug)

  if (!tool) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <ToolDetail tool={tool} />
    </div>
  )
}
