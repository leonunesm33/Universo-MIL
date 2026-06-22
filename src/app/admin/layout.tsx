import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { AdminClientShell } from '@/components/admin/AdminClientShell'
import { can } from '@/lib/permissions'
import type { AppRole } from '@/types/next-auth'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  const role = session?.user?.role as AppRole | undefined

  if (!role || (!can(role, 'admin_panel') && !can(role, 'admin_analytics'))) {
    redirect('/login')
  }

  const name = session!.user.name ?? 'Admin'

  return (
    <AdminClientShell name={name} role={role}>
      {children}
    </AdminClientShell>
  )
}
