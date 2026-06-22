'use client'

import { useState, useTransition } from 'react'
import { deleteCourse } from '@/app/admin/actions/content'
import { ConfirmDeleteModal } from '@/components/admin/ConfirmDeleteModal'

export function DeleteCourseButton({ courseId, courseName }: { courseId: string; courseName: string }) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  function handleConfirm() {
    startTransition(async () => {
      await deleteCourse(courseId)
      setOpen(false)
    })
  }

  return (
    <>
      {open && (
        <ConfirmDeleteModal
          title={`Excluir "${courseName}"?`}
          description="Todos os módulos, aulas e progresso dos alunos serão excluídos. Esta ação não pode ser desfeita."
          onConfirm={handleConfirm}
          onCancel={() => setOpen(false)}
          pending={pending}
        />
      )}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs text-red-500 hover:text-red-700"
      >
        Excluir
      </button>
    </>
  )
}
