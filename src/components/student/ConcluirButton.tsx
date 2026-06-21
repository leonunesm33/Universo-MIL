'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface ConcluirButtonProps {
  lessonId: string
  initialCompleted: boolean
}

export function ConcluirButton({ lessonId, initialCompleted }: ConcluirButtonProps) {
  const [completed, setCompleted] = useState(initialCompleted)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function toggle() {
    if (loading) return
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
      disabled={loading}
      aria-pressed={completed}
      aria-label={completed ? 'Aula concluída — clique para desfazer' : 'Marcar aula como concluída'}
      className={`flex items-center gap-2 px-4 h-11 rounded-lg text-sm font-medium border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-60 ${
        completed
          ? 'bg-brand/10 border-brand text-brand'
          : 'border-[#333] text-gray-400 hover:border-[#555] hover:text-gray-200'
      }`}
    >
      <span className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
        completed ? 'bg-brand border-brand' : 'border-[#555]'
      }`}>
        {completed && (
          <svg viewBox="0 0 12 12" className="w-3 h-3 text-white fill-current">
            <path d="M10 3L5 8.5 2 5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
        )}
      </span>
      Concluir
    </button>
  )
}
