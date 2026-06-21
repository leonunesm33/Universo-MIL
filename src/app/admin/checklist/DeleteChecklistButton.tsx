'use client'

import { useTransition } from 'react'
import { deleteChecklistTemplate } from '@/app/admin/actions/checklist'

export function DeleteChecklistButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm('Excluir este template e todas as respostas? Esta ação não pode ser desfeita.')) return
    startTransition(async () => {
      await deleteChecklistTemplate(id)
    })
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={pending}
      className="text-xs text-red-400 hover:text-red-600 font-medium disabled:opacity-50"
    >
      {pending ? 'Excluindo…' : 'Excluir template'}
    </button>
  )
}
