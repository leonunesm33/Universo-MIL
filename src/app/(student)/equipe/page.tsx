import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'

export const metadata = { title: 'Minha Equipe' }

export default async function EquipePage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, storeId: true, store: { select: { name: true } } },
  })
  if (!currentUser) redirect('/login')

  const isSupervisao = currentUser.role === 'SUPERVISAO'

  const where = {
    blocked: false,
    role: { not: 'ADMIN' as const },
    ...(isSupervisao && currentUser.storeId
      ? { storeId: currentUser.storeId }
      : {}),
  }

  const members = await prisma.user.findMany({
    where,
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      role: true,
      lastAccessAt: true,
      _count: { select: { progress: true } },
    },
  })

  const roleLabel: Record<string, string> = {
    COLABORADOR: 'Colaboradora',
    SUPERVISAO: 'Supervisão',
    GERENTE: 'Gerente',
    GESTAO: 'Gestão',
  }

  function initials(name: string) {
    return name.split(' ').filter(Boolean).map((n) => n[0]).slice(0, 2).join('').toUpperCase() || '?'
  }

  const storeName = isSupervisao && currentUser.store ? currentUser.store.name : null

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Minha Equipe</h1>
        <p className="text-white/60 mt-1 text-sm">
          {members.length} colaborador{members.length !== 1 ? 'as' : 'a'}
          {storeName && (
            <span className="ml-2 text-white/40">· {storeName}</span>
          )}
        </p>
      </div>

      {members.length === 0 ? (
        <div className="text-center py-16 text-white/30">
          <p>Nenhum colaborador encontrado na sua loja.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((m) => (
            <Link
              key={m.id}
              href={`/equipe/${m.id}`}
              className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/8 transition-colors group flex flex-col gap-3"
            >
              <div className="flex items-center gap-3">
                {m.avatar ? (
                  <Image
                    src={m.avatar}
                    alt={m.name}
                    width={44}
                    height={44}
                    className="w-11 h-11 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-[var(--brand)]/20 flex items-center justify-center text-[var(--brand)] font-bold text-sm shrink-0">
                    {initials(m.name)}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-white truncate">
                    {m.name}
                    {m.id === currentUser.id && <span className="text-white/40 text-xs ml-1">(você)</span>}
                  </p>
                  <p className="text-white/50 text-xs truncate">{m.email}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-white/50 bg-white/10 px-2 py-0.5 rounded">
                  {roleLabel[m.role] ?? m.role}
                </span>
                <span className="text-xs text-white/40">
                  {m._count.progress} aula{m._count.progress !== 1 ? 's' : ''} assistida{m._count.progress !== 1 ? 's' : ''}
                </span>
              </div>

              {m.lastAccessAt && (
                <p className="text-xs text-white/30">
                  Último acesso: {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(new Date(m.lastAccessAt))}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
