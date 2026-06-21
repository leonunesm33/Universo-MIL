import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { can } from '@/lib/permissions'
import type { AppRole } from '@/types/next-auth'

export const metadata = { title: 'Dashboard de Checklists' }

export default async function ChecklistDashboardPage() {
  const session = await auth()
  if (!session) redirect('/login')
  if (!can(session.user.role as AppRole, 'checklist_dash')) redirect('/homepage')

  const responses = await prisma.checklistResponse.findMany({
    orderBy: { submittedAt: 'desc' },
    include: {
      template: { select: { title: true } },
      responder: { select: { name: true } },
      items: { select: { ok: true } },
    },
    take: 100,
  })

  const avgScore = responses.length > 0
    ? Math.round(responses.filter((r) => r.score !== null).reduce((sum, r) => sum + (r.score ?? 0), 0) / responses.filter((r) => r.score !== null).length)
    : null

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard de Checklists</h1>
        <p className="text-white/60 mt-1 text-sm">Histórico e resultados de todas as avaliações</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <p className="text-white/50 text-sm">Total de Avaliações</p>
          <p className="text-3xl font-bold text-white mt-1">{responses.length}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <p className="text-white/50 text-sm">Média de Conformidade</p>
          <p className="text-3xl font-bold text-[var(--brand)] mt-1">
            {avgScore !== null ? `${avgScore}%` : '—'}
          </p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <p className="text-white/50 text-sm">Lojas Avaliadas</p>
          <p className="text-3xl font-bold text-white mt-1">
            {new Set(responses.map((r) => r.storeName)).size}
          </p>
        </div>
      </div>

      {responses.length === 0 ? (
        <div className="text-center py-20 text-white/40">
          <p>Nenhuma avaliação registrada ainda.</p>
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-white/40 text-left">
                <th className="px-4 py-3 font-medium">Loja</th>
                <th className="px-4 py-3 font-medium">Checklist</th>
                <th className="px-4 py-3 font-medium">Responsável</th>
                <th className="px-4 py-3 font-medium">Score</th>
                <th className="px-4 py-3 font-medium">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/8">
              {responses.map((r) => {
                const score = r.score
                const scoreColor = score === null ? 'text-white/40'
                  : score >= 80 ? 'text-green-400'
                  : score >= 60 ? 'text-amber-400'
                  : 'text-red-400'
                return (
                  <tr key={r.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 text-white font-medium">{r.storeName}{r.storeCode ? ` (${r.storeCode})` : ''}</td>
                    <td className="px-4 py-3 text-white/70">{r.template.title}</td>
                    <td className="px-4 py-3 text-white/60">{r.responder.name}</td>
                    <td className={`px-4 py-3 font-bold ${scoreColor}`}>
                      {score !== null ? `${score}%` : '—'}
                    </td>
                    <td className="px-4 py-3 text-white/50">
                      {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(r.submittedAt))}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
