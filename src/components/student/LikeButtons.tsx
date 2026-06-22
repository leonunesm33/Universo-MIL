'use client'

import { useState } from 'react'

interface LikeButtonsProps {
  lessonId: string
  initialLike: 'LIKE' | 'DISLIKE' | null
  likeCount: number
  dislikeCount: number
}

export function LikeButtons({ lessonId, initialLike, likeCount, dislikeCount }: LikeButtonsProps) {
  const [current, setCurrent] = useState<'LIKE' | 'DISLIKE' | null>(initialLike)
  const [counts, setCounts] = useState({ like: likeCount, dislike: dislikeCount })
  const [loading, setLoading] = useState(false)

  async function toggle(type: 'LIKE' | 'DISLIKE') {
    if (loading) return
    // Capture before await so the update is based on state at click time
    const prev = current
    const next = prev === type ? null : type

    setLoading(true)
    try {
      const res = await fetch(`/api/lessons/${lessonId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      })
      if (!res.ok) return

      setCurrent(next)
      setCounts((c) => {
        const updated = { ...c }
        if (prev) updated[prev.toLowerCase() as 'like' | 'dislike'] -= 1
        if (next) updated[next.toLowerCase() as 'like' | 'dislike'] += 1
        return updated
      })
    } finally {
      setLoading(false)
    }
  }

  const btnClass = (active: boolean) =>
    `flex items-center gap-1 px-3 h-9 rounded-lg text-sm font-medium border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
      active
        ? 'bg-brand/10 border-brand text-brand'
        : 'border-[#333] text-gray-400 hover:border-[#555] hover:text-gray-200'
    } disabled:opacity-50 disabled:cursor-not-allowed`

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => toggle('LIKE')}
        aria-label="Gostei"
        disabled={loading}
        className={btnClass(current === 'LIKE')}
      >
        👍 {counts.like}
      </button>
      <button
        onClick={() => toggle('DISLIKE')}
        aria-label="Não gostei"
        disabled={loading}
        className={btnClass(current === 'DISLIKE')}
      >
        👎 {counts.dislike}
      </button>
    </div>
  )
}
