import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { can } from '@/lib/permissions'
import type { AppRole } from '@/types/next-auth'

export default async function EquipeLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/login')
  if (!can(session.user.role as AppRole, 'team_evolution')) redirect('/homepage')
  return <>{children}</>
}
