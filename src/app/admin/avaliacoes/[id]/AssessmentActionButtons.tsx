'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toggleAssessmentStatus, deleteAssessment } from '@/app/admin/actions/assessments'
import { ConfirmDeleteModal } from '@/components/admin/ConfirmDeleteModal'

export function AssessmentActionButtons({
  id,
  status,
}: {
  id: string
  status: string
}) {
  const [pending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const router = useRouter()

  function handleToggle() {
    startTransition(async () => {
      await toggleAssessmentStatus(id, status)
      router.refresh()
    })
  }

  function handleConfirmDelete() {
    startTransition(async () => {
      await deleteAssessment(id)
      setOpen(false)
    })
  }

  return (
    <>
      {open && (
        <ConfirmDeleteModal
          title="Excluir avaliação?"
          description="Todas as respostas serão excluídas. Esta ação não pode ser desfeita."
          onConfirm={handleConfirmDelete}
          onCancel={() => setOpen(false)}
          pending={pending}
        />
      )}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleToggle}
          disabled={pending}
          className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
            status === 'ACTIVE'
              ? 'bg-red-50 text-red-600 hover:bg-red-100'
              : 'bg-green-50 text-green-700 hover:bg-green-100'
          }`}
        >
          {status === 'ACTIVE' ? 'Desativar' : 'Ativar'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(true)}
          disabled={pending}
          className="text-xs text-red-400 hover:text-red-600 font-medium disabled:opacity-50"
        >
          Excluir
        </button>
      </div>
    </>
  )
}
