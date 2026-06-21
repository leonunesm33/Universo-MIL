'use client'

import { useState } from 'react'

interface FavoriteButtonProps {
  lessonId: string
  initialFavorited: boolean
}

export function FavoriteButton({ lessonId, initialFavorited }: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(initialFavorited)
  const [loading, setLoading] = useState(false)

  async function toggle() {
    if (loading) return
    setLoading(true)
    const res = await fetch(`/api/lessons/${lessonId}/favorite`, { method: 'POST' })
    if (res.ok) setFavorited((f) => !f)
    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      aria-pressed={favorited}
      aria-label={favorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
      className={`flex items-center gap-1.5 px-3 h-9 rounded-lg text-sm font-medium border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-60 ${
        favorited
          ? 'bg-brand/10 border-brand text-brand'
          : 'border-[#333] text-gray-400 hover:border-[#555] hover:text-gray-200'
      }`}
    >
      {favorited ? '⭐' : '☆'} Favoritar
    </button>
  )
}
