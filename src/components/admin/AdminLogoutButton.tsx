'use client'

import { signOut } from 'next-auth/react'

interface Props {
  initial: string
  name: string
}

export function AdminLogoutButton({ initial, name }: Props) {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/login' })}
      title={`Sair (${name})`}
      aria-label={`Sair da conta de ${name}`}
      className="w-7 h-7 rounded-full bg-brand hover:bg-brand-dark active:scale-95 transition-all flex items-center justify-center text-white text-[11px] font-bold shrink-0"
    >
      {initial}
    </button>
  )
}
