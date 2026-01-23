export const dynamic = 'force-dynamic'

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
