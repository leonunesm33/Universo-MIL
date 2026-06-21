'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function DeletePOPButton({ slug, title }: { slug: string; title: string }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)
    await fetch(`/api/pop/${slug}`, { method: 'DELETE' })
    router.refresh()
  }

  if (confirming) {
    return (
      <span className="flex items-center gap-1">
        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-xs text-red-600 font-medium hover:text-red-700 disabled:opacity-50"
        >
          {loading ? '...' : 'Confirmar'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs text-slate-400 hover:text-slate-600"
        >
          Cancelar
        </button>
      </span>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      title={`Excluir ${title}`}
      className="text-xs text-red-400 hover:text-red-600 font-medium"
    >
      Excluir
    </button>
  )
}
