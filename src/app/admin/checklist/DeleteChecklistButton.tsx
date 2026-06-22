'use client'

import { useState, useTransition } from 'react'
import { deleteChecklistTemplate } from '@/app/admin/actions/checklist'
import { ConfirmDeleteModal } from '@/components/admin/ConfirmDeleteModal'

export function DeleteChecklistButton({ id }: { id: string }) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  function handleConfirm() {
    startTransition(async () => {
      await deleteChecklistTemplate(id)
      setOpen(false)
    })
  }

  return (
    <>
      {open && (
        <ConfirmDeleteModal
          title="Excluir template?"
          description="Todas as respostas serão excluídas. Esta ação não pode ser desfeita."
          onConfirm={handleConfirm}
          onCancel={() => setOpen(false)}
          pending={pending}
        />
      )}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs text-red-400 hover:text-red-600 font-medium"
      >
        Excluir template
      </button>
    </>
  )
}
