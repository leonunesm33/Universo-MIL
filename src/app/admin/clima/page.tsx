import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ToggleResearchButton } from './ToggleResearchButton'

export const metadata = { title: 'Admin — Pesquisa de Clima' }

export default async function AdminClimaPage() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/homepage')

  const researches = await prisma.climateResearch.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { responses: true, questions: true } },
    },
  })

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Pesquisa de Clima</h1>
          <p className="text-sm text-slate-500 mt-1">{researches.length} pesquisa{researches.length !== 1 ? 's' : ''}</p>
        </div>
        <Link
          href="/admin/clima/nova"
          className="inline-flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand/90 transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nova Pesquisa
        </Link>
      </div>

      {researches.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-100 p-8 text-center">
          <p className="text-slate-400 text-sm">Nenhuma pesquisa criada ainda.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {researches.map((r) => (
            <div key={r.id} className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-semibold text-slate-800">{r.title}</h2>
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                      r.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {r.isActive ? 'Ativa' : 'Inativa'}
                    </span>
                    {r.isAnonymous && (
                      <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                        Anônima
                      </span>
                    )}
                  </div>
                  {r.description && (
                    <p className="text-sm text-slate-500 mb-3">{r.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span>{r._count.questions} pergunta{r._count.questions !== 1 ? 's' : ''}</span>
                    <span>{r._count.responses} resposta{r._count.responses !== 1 ? 's' : ''}</span>
                    <span>Criada em {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(new Date(r.createdAt))}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/admin/clima/${r.id}/editar`}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium px-3 py-1.5 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    Editar
                  </Link>
                  <ToggleResearchButton id={r.id} isActive={r.isActive} />
                  {r._count.responses > 0 && (
                    <Link
                      href={`/admin/clima/${r.id}`}
                      className="text-xs text-brand hover:text-brand/80 font-medium px-3 py-1.5 border border-brand/20 rounded-lg hover:bg-brand/5 transition-colors"
                    >
                      Ver resultados
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
