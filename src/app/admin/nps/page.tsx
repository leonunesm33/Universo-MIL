import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ToggleNPSButton } from './ToggleNPSButton'

export const metadata = { title: 'Admin — Satisfação da Equipe' }

export default async function AdminNPSPage() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/homepage')

  const campaigns = await prisma.nPSCampaign.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      responses: { select: { score: true } },
    },
  })

  function calcNPS(scores: number[]) {
    if (scores.length === 0) return null
    const promoters = scores.filter((s) => s >= 9).length
    const detractors = scores.filter((s) => s <= 6).length
    return Math.round(((promoters - detractors) / scores.length) * 100)
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Satisfação da Equipe</h1>
          <p className="text-sm text-slate-500 mt-0.5">Pesquisa de satisfação com líderes diretos</p>
        </div>
        <Link
          href="/admin/nps/nova"
          className="inline-flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand/90 transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nova Campanha
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <p>Nenhuma campanha criada ainda.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {campaigns.map((c) => {
            const scores = c.responses.map((r) => r.score)
            const nps = calcNPS(scores)
            const npsColor = nps === null ? 'text-slate-400'
              : nps >= 50 ? 'text-green-600'
              : nps >= 0 ? 'text-amber-600'
              : 'text-red-600'

            return (
              <div key={c.id} className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="font-semibold text-slate-800">{c.title}</h2>
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                        c.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {c.isActive ? 'Ativa' : 'Encerrada'}
                      </span>
                    </div>
                    {c.description && (
                      <p className="text-sm text-slate-500 mb-2">{c.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span>{scores.length} resposta{scores.length !== 1 ? 's' : ''}</span>
                      <span className={`font-bold ${npsColor}`}>
                        NPS: {nps !== null ? nps : '—'}
                      </span>
                      {c.deadlineDate && (
                        <span>
                          Prazo: {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(new Date(c.deadlineDate))}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/admin/nps/${c.id}/editar`}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium px-3 py-1.5 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      Editar
                    </Link>
                    <ToggleNPSButton id={c.id} isActive={c.isActive} />
                    <Link
                      href={`/admin/nps/${c.id}`}
                      className="text-xs text-brand hover:text-brand/80 font-medium px-3 py-1.5 border border-brand/20 rounded-lg hover:bg-brand/5 transition-colors"
                    >
                      Ver detalhes
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
