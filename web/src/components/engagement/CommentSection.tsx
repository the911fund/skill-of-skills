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
