'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface ConcluirButtonProps {
  lessonId: string
  initialCompleted: boolean
  videoCompleted?: boolean
}

export function ConcluirButton({ lessonId, initialCompleted, videoCompleted = true }: ConcluirButtonProps) {
  const [completed, setCompleted] = useState(initialCompleted)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Sync when server-side data refreshes (e.g. after router.refresh() from auto-complete)
  useEffect(() => {
    if (initialCompleted && !completed) setCompleted(true)
  }, [initialCompleted])

  const locked = !videoCompleted && !completed

  async function toggle() {
    if (loading || locked) return
    setLoading(true)
    const next = !completed
    setCompleted(next)
    try {
      await fetch(`/api/lessons/${lessonId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: next, watchedSecs: next ? 99999 : 0 }),
      })
      router.refresh()
    } catch {
      setCompleted(!next)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading || locked}
      aria-pressed={completed}
      aria-label={
        locked
          ? 'Assista ao vídeo para concluir a aula'
          : completed
          ? 'Aula concluída — clique para desfazer'
          : 'Marcar aula como concluída'
      }
      title={locked ? 'Assista ao vídeo para concluir' : undefined}
      className={`flex items-center gap-2 px-4 h-11 rounded-lg text-sm font-medium border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
        completed
          ? 'bg-brand/10 border-brand text-brand'
          : locked
          ? 'border-[#222] text-gray-700 cursor-not-allowed'
          : 'border-[#333] text-gray-400 hover:border-[#555] hover:text-gray-200'
      } disabled:opacity-60`}
    >
      <span className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
        completed ? 'bg-brand border-brand' : locked ? 'border-[#333]' : 'border-[#555]'
      }`}>
        {completed && (
          <svg viewBox="0 0 12 12" className="w-3 h-3 text-white fill-current">
            <path d="M10 3L5 8.5 2 5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
        )}
        {locked && !completed && (
          <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 text-gray-600 fill-current">
            <path d="M9 5H3V9a1 1 0 001 1h4a1 1 0 001-1V5zM4.5 5V3.5a1.5 1.5 0 013 0V5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
          </svg>
        )}
      </span>
      Concluir
    </button>
  )
}
