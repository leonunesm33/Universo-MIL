import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminLogoutButton } from '@/components/admin/AdminLogoutButton'
import { can } from '@/lib/permissions'
import type { AppRole } from '@/types/next-auth'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  const role = session?.user?.role as AppRole | undefined

  if (!role || (!can(role, 'admin_panel') && !can(role, 'admin_analytics'))) {
    redirect('/login')
  }

  const name = session!.user.name ?? 'Admin'
  const initial = name.charAt(0).toUpperCase()

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar adminName={name} userRole={role} />
      <div className="admin-content">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-11 bg-[#0f172a] flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/dashboard"
              className="text-sm font-medium text-white/50 hover:text-white/80 transition-colors"
            >
              Universo <span className="text-white font-semibold">Mil</span>
            </Link>
            <Link
              href="/homepage"
              className="text-xs text-white/40 hover:text-white/70 transition-colors px-2 py-1 rounded border border-white/10 hover:border-white/25"
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
        {/* Page content */}
        <main className="p-6 min-h-[calc(100vh-2.75rem)]">
          {children}
        </main>
      </div>
    </div>
  )
}
