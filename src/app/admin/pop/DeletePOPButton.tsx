'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ConfirmDeleteModal } from '@/components/admin/ConfirmDeleteModal'

export function DeletePOPButton({ slug, title }: { slug: string; title: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleConfirm() {
    setLoading(true)
    await fetch(`/api/pop/${slug}`, { method: 'DELETE' })
    router.refresh()
    setOpen(false)
  }

  return (
    <>
      {open && (
        <ConfirmDeleteModal
          title={`Excluir "${title}"?`}
          description="Esta ação não pode ser desfeita."
          onConfirm={handleConfirm}
          onCancel={() => setOpen(false)}
          pending={loading}
        />
      )}
      <button
        onClick={() => setOpen(true)}
        title={`Excluir ${title}`}
        className="text-xs text-red-400 hover:text-red-600 font-medium"
      >
        Excluir
      </button>
    </>
  )
}
