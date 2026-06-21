'use client'

import { useState, useTransition } from 'react'
import { deleteUser } from '@/app/admin/actions/users'
import { toast } from 'sonner'

export function DeleteUserButton({ userId, userName }: { userId: string; userName: string }) {
  const [confirming, setConfirming] = useState(false)
  const [pending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteUser(userId)
        toast.success(`${userName} excluído(a).`)
      } catch {
        toast.error('Erro ao excluir usuário.')
      }
    })
  }

  if (confirming) {
    return (
      <span className="flex items-center gap-1.5">
        <button
          onClick={handleDelete}
          disabled={pending}
          className="text-xs text-red-600 font-medium hover:text-red-700 disabled:opacity-50"
        >
          {pending ? '…' : 'Confirmar'}
        </button>
        <button onClick={() => setConfirming(false)} className="text-xs text-slate-400 hover:text-slate-600">
          Não
        </button>
      </span>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-xs text-red-400 hover:text-red-600 font-medium"
    >
      Excluir
    </button>
  )
}
