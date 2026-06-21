'use client'

import { useTransition } from 'react'
import { deleteClimateResearch } from '@/app/admin/actions/clima'

export function DeleteClimateButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm('Excluir esta pesquisa e todas as respostas? Esta ação não pode ser desfeita.')) return
    startTransition(async () => {
      await deleteClimateResearch(id)
    })
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={pending}
      className="text-xs text-red-400 hover:text-red-600 font-medium disabled:opacity-50"
    >
      {pending ? 'Excluindo…' : 'Excluir pesquisa'}
    </button>
  )
}
