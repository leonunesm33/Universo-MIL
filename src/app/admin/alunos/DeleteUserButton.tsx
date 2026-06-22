'use client'

import { useState, useTransition } from 'react'
import { deleteUser } from '@/app/admin/actions/users'
import { toast } from 'sonner'
import { ConfirmDeleteModal } from '@/components/admin/ConfirmDeleteModal'

export function DeleteUserButton({ userId, userName }: { userId: string; userName: string }) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  function handleConfirm() {
    startTransition(async () => {
      try {
        await deleteUser(userId)
        toast.success(`${userName} excluído(a).`)
        setOpen(false)
      } catch {
        toast.error('Erro ao excluir usuário.')
      }
    })
  }

  return (
    <>
      {open && (
        <ConfirmDeleteModal
          title={`Excluir ${userName}?`}
          description="Esta ação não pode ser desfeita."
          onConfirm={handleConfirm}
          onCancel={() => setOpen(false)}
          pending={pending}
        />
      )}
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-red-400 hover:text-red-600 font-medium"
      >
        Excluir
      </button>
    </>
  )
}
