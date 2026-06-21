'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function ToggleChecklistButton({ id, status }: { id: string; status: 'ACTIVE' | 'INACTIVE' }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function toggle() {
    setLoading(true)
    await fetch(`/api/checklist/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' }),
    })
    router.refresh()
    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
        status === 'ACTIVE'
          ? 'bg-red-50 text-red-600 hover:bg-red-100'
          : 'bg-green-50 text-green-700 hover:bg-green-100'
      }`}
    >
      {loading ? '...' : status === 'ACTIVE' ? 'Desativar' : 'Ativar'}
    </button>
  )
}
