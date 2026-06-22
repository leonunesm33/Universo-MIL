import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'

interface Props { params: Promise<{ id: string }> }

export const metadata = { title: 'Admin — Resultados Satisfação da Equipe' }

function scoreTextColor(score: number) {
  if (score >= 8) return 'text-green-600'
  if (score >= 6) return 'text-amber-600'
  return 'text-red-600'
}

function scoreBarColor(score: number) {
  if (score >= 8) return 'bg-green-400'
  if (score >= 6) return 'bg-amber-400'
  return 'bg-red-400'
}

export default async function NPSDetailsPage({ params }: Props) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/homepage')

  const { id } = await params
  const campaign = await prisma.nPSCampaign.findUnique({
    where: { id },
    include: {
      responses: {
        include: {
          responder: { select: { name: true, email: true } },
          leader: { select: { name: true } },
        },
        orderBy: { submittedAt: 'desc' },
      },
    },
  })

  if (!campaign) notFound()

  const scores = campaign.responses.map((r) => r.score)
  const avgRaw = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null
  const avgDisplay = avgRaw !== null ? avgRaw.toFixed(1) : null

  const leaderMap = new Map<string, { name: string; scores: number[] }>()
  campaign.responses.forEach((r) => {
    if (!r.leader || !r.leaderId) return
    if (!leaderMap.has(r.leaderId)) leaderMap.set(r.leaderId, { name: r.leader.name, scores: [] })
    leaderMap.get(r.leaderId)!.scores.push(r.score)
  })
  const leaderAverages = Array.from(leaderMap.values())
    .map(({ name, scores: ls }) => ({
      name,
      avg: ls.reduce((a, b) => a + b, 0) / ls.length,
      count: ls.length,
    }))
    .sort((a, b) => b.avg - a.avg)

  const distribution: Record<number, number> = {}
  for (let i = 0; i <= 10; i++) distribution[i] = 0
  scores.forEach((s) => { distribution[s]++ })
  const maxCount = Math.max(...Object.values(distribution), 1)

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/nps" className="text-slate-400 hover:text-slate-600 transition-colors">
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-slate-800">{campaign.title}</h1>
          <p className="text-sm text-slate-500">{scores.length} resposta{scores.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500">Nota Média Geral</p>
          <p className={`text-3xl font-bold mt-1 ${avgRaw !== null ? scoreTextColor(avgRaw) : 'text-slate-400'}`}>
            {avgDisplay ?? '—'}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500">Respostas</p>
          <p className="text-3xl font-bold text-slate-700 mt-1">{scores.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500">Líderes Avaliados</p>
          <p className="text-3xl font-bold text-slate-700 mt-1">{leaderAverages.length}</p>
        </div>
      </div>

      {leaderAverages.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
          <p className="text-sm font-medium text-slate-700 mb-4">Nota Média por Líder</p>
          <div className="space-y-3">
            {leaderAverages.map((l) => (
              <div key={l.name} className="flex items-center gap-4">
                <span className="text-sm text-slate-700 w-44 shrink-0 truncate">{l.name}</span>
                <div className="flex-1 bg-slate-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${scoreBarColor(l.avg)}`}
                    style={{ width: `${(l.avg / 10) * 100}%` }}
                  />
                </div>
                <span className={`text-sm font-bold w-10 text-right shrink-0 ${scoreTextColor(l.avg)}`}>
                  {l.avg.toFixed(1)}
                </span>
                <span className="text-xs text-slate-400 w-24 text-right shrink-0">
                  {l.count} resposta{l.count !== 1 ? 's' : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {scores.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
          <p className="text-sm font-medium text-slate-700 mb-4">Distribuição de Notas</p>
          <div className="flex items-end gap-2 h-24">
            {Object.entries(distribution).map(([val, count]) => {
              const n = Number(val)
              return (
                <div key={val} className="flex flex-col items-center gap-1 flex-1">
                  <span className="text-xs text-slate-500">{count || ''}</span>
                  <div
                    className={`w-full rounded-t ${scoreBarColor(n)}`}
                    style={{ height: `${(count / maxCount) * 100}%`, minHeight: count > 0 ? '4px' : '0' }}
                  />
                  <span className="text-xs text-slate-400">{val}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {campaign.responses.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500 text-left">
                <th className="px-4 py-3 font-medium">Colaborador</th>
                <th className="px-4 py-3 font-medium">Líder avaliado</th>
                <th className="px-4 py-3 font-medium">Nota</th>
                <th className="px-4 py-3 font-medium hidden lg:table-cell">Comentário</th>
                <th className="px-4 py-3 font-medium">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {campaign.responses.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{r.responder.name}</td>
                  <td className="px-4 py-3 text-slate-600">{r.leader?.name ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-bold ${scoreTextColor(r.score)}`}>{r.score}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 max-w-xs truncate hidden lg:table-cell">{r.comment || '—'}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">
                    {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(new Date(r.submittedAt))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
