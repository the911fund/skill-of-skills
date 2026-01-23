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
