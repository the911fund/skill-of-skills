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
