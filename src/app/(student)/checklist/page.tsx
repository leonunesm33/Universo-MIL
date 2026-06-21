import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import type { AppRole } from '@/types/next-auth'

export const metadata = { title: 'Checklist de Padronização' }

export default async function ChecklistPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const role = session.user.role as AppRole
  const canSeeHistory = ['SUPERVISAO', 'GESTAO', 'ADMIN'].includes(role)

  const [templates, history] = await Promise.all([
    prisma.checklistTemplate.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { items: true } } },
    }),
    canSeeHistory
      ? prisma.checklistResponse.findMany({
          where: { responderId: session.user.id },
          include: { template: { select: { title: true } } },
          orderBy: { submittedAt: 'desc' },
          take: 20,
        })
      : Promise.resolve([]),
  ])

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Checklist de Padronização</h1>
        <p className="text-white/60 mt-1 text-sm">Realize a avaliação de conformidade da sua loja</p>
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-20 text-white/40">
          <svg viewBox="0 0 24 24" className="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 11 12 14 22 4"/>
            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
          </svg>
          <p>Nenhum checklist disponível no momento.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {templates.map((t) => (
            <div key={t.id} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/8 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="font-semibold text-white text-lg">{t.title}</h2>
                  {t.description && (
                    <p className="text-white/60 text-sm mt-1">{t.description}</p>
                  )}
                  <p className="text-white/40 text-xs mt-2">{t._count.items} item{t._count.items !== 1 ? 's' : ''}</p>
                </div>
                <Link
                  href={`/checklist/${t.id}/responder`}
                  className="shrink-0 inline-flex items-center gap-2 bg-[var(--brand)] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[var(--brand)]/90 transition-colors"
                >
                  Iniciar
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {canSeeHistory && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-white mb-4">Histórico de Respostas</h2>
          {history.length === 0 ? (
            <p className="text-white/40 text-sm">Nenhum checklist respondido ainda.</p>
          ) : (
            <div className="space-y-3">
              {history.map((r) => {
                const score = r.score
                const scoreColor = score === null ? 'text-white/40' : score >= 80 ? 'text-emerald-400' : score >= 60 ? 'text-yellow-400' : 'text-red-400'
                return (
                  <div key={r.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-white font-medium truncate">{r.template.title}</p>
                      <p className="text-white/50 text-sm">
                        {r.storeName} · {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(r.submittedAt))}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <span className={`text-sm font-bold ${scoreColor}`}>
                        {score !== null ? `${Math.round(score)}%` : '—'}
                      </span>
                      <Link
                        href={`/checklist/resposta/${r.id}`}
                        className="text-xs text-[var(--brand)] hover:underline"
                      >
                        Ver detalhes
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
