'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminLogoutButton } from '@/components/admin/AdminLogoutButton'
import type { AppRole } from '@/types/next-auth'

interface Props {
  name: string
  role: AppRole
  children: React.ReactNode
}

export function AdminClientShell({ name, role, children }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const initial = name.charAt(0).toUpperCase()

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar
        adminName={name}
        userRole={role}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="admin-content">
        <header className="sticky top-0 z-30 h-11 bg-[#0f172a] flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menu"
              className="sm:hidden flex items-center justify-center w-8 h-8 rounded text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <Link
              href="/admin/dashboard"
              className="text-sm font-medium text-white/50 hover:text-white/80 transition-colors"
            >
              Universo <span className="text-white font-semibold">Mil</span>
            </Link>
            <Link
              href="/homepage"
              className="hidden sm:block text-xs text-white/40 hover:text-white/70 transition-colors px-2 py-1 rounded border border-white/10 hover:border-white/25"
            >
              Área de Aprendizagem
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/50 hidden sm:block">{name}</span>
            <span className="text-[10px] text-white/40 hidden sm:block">
              {role === 'ADMIN' ? 'Admin' : role}
            </span>
            <AdminLogoutButton initial={initial} name={name} />
          </div>
        </header>
        <main className="p-4 sm:p-6 min-h-[calc(100vh-2.75rem)]">
          {children}
        </main>
      </div>
    </div>
  )
}
