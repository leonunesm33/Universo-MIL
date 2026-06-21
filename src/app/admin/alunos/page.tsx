import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { InviteModal } from './InviteModal'
import { resendInvite, deleteUser } from '@/app/admin/actions/users'
import { DeleteUserButton } from './DeleteUserButton'

function getInviteStatus(
  passwordHash: string | null,
  tokens: { expiresAt: Date; usedAt: Date | null }[]
): { label: string; color: string } {
  if (passwordHash) return { label: 'Ativo', color: 'bg-green-100 text-green-700' }
  const latest = tokens
    .filter((t) => !t.usedAt)
    .sort((a, b) => b.expiresAt.getTime() - a.expiresAt.getTime())[0]
  if (!latest) return { label: 'Sem convite', color: 'bg-slate-100 text-slate-500' }
  if (latest.expiresAt < new Date()) return { label: 'Expirado', color: 'bg-red-100 text-red-600' }
  return { label: 'Pendente', color: 'bg-yellow-100 text-yellow-700' }
}

function getInitialsColor(name: string) {
  const colors = [
    'bg-rose-400', 'bg-pink-400', 'bg-fuchsia-400', 'bg-purple-400',
    'bg-indigo-400', 'bg-blue-400', 'bg-cyan-400', 'bg-teal-400',
    'bg-emerald-400', 'bg-amber-400',
  ]
  let hash = 0
  for (const c of name) hash = c.charCodeAt(0) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

export default async function AlunosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>
}) {
  const { q, status } = await searchParams

  const [students, stores] = await Promise.all([
    prisma.user.findMany({
      where: {
        role: { not: 'ADMIN' },
        ...(q
          ? {
              OR: [
                { name: { contains: q, mode: 'insensitive' } },
                { email: { contains: q, mode: 'insensitive' } },
              ],
            }
          : {}),
        ...(status === 'blocked' ? { blocked: true } : {}),
        ...(status === 'active' ? { blocked: false } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        store: { select: { name: true, code: true } },
        _count: { select: { courses: true } },
        inviteTokens: {
          select: { expiresAt: true, usedAt: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    }),
    prisma.store.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, code: true },
    }),
  ])

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Alunos</h1>
          <p className="text-sm text-slate-500 mt-1">{students.length} aluno(s) encontrado(s)</p>
        </div>
        <InviteModal stores={stores} />
      </div>

      {/* Search + filter form */}
      <form className="mb-4 flex gap-2" method="GET">
        <input
          name="q"
          defaultValue={q ?? ''}
          placeholder="Buscar por nome ou email..."
          className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:border-brand"
        />
        <select
          name="status"
          defaultValue={status ?? ''}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-brand bg-white"
        >
          <option value="">Todos</option>
          <option value="active">Ativos</option>
          <option value="blocked">Bloqueados</option>
        </select>
        <button
          type="submit"
          className="bg-brand hover:bg-brand/90 text-white text-sm px-4 py-2 rounded-lg transition-colors"
        >
          Filtrar
        </button>
      </form>

      {/* Students table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {students.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-slate-400 text-sm">Nenhum aluno encontrado.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wide px-4 py-3">Aluno</th>
                <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wide px-4 py-3 hidden lg:table-cell">Loja</th>
                <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wide px-4 py-3 hidden md:table-cell">Cursos</th>
                <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wide px-4 py-3 hidden lg:table-cell">Último acesso</th>
                <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wide px-4 py-3">Acesso</th>
                <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wide px-4 py-3">Status</th>
                <th className="px-4 py-3 w-32" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((student) => {
                const inviteStatus = getInviteStatus(student.passwordHash, student.inviteTokens)
                const avatarColor = getInitialsColor(student.name)
                const canResend = !student.passwordHash
                return (
                  <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${avatarColor} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                          {student.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-700 truncate">{student.name}</p>
                          <p className="text-xs text-slate-400 truncate">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-sm text-slate-500">
                        {student.store ? student.store.name : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-sm text-slate-600">{student._count.courses}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-sm text-slate-500">
                        {student.lastAccessAt
                          ? student.lastAccessAt.toLocaleDateString('pt-BR')
                          : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${inviteStatus.color}`}>
                        {inviteStatus.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        student.blocked ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                      }`}>
                        {student.blocked ? 'Bloqueado' : 'Ativo'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        {canResend && (
                          <form action={resendInvite.bind(null, student.id)}>
                            <button
                              type="submit"
                              className="text-xs text-brand hover:text-brand/80 font-medium"
                              title="Reenviar convite"
                            >
                              Reenviar
                            </button>
                          </form>
                        )}
                        <Link
                          href={`/admin/alunos/${student.id}`}
                          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Ver
                        </Link>
                        <DeleteUserButton userId={student.id} userName={student.name} />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
