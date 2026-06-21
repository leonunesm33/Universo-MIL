import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ storeId?: string }>
}

export const metadata = { title: 'Admin — Resultados de Clima' }

function average(nums: number[]) {
  if (nums.length === 0) return null
  return (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1)
}

export default async function ClimaResultsPage({ params, searchParams }: Props) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/homepage')

  const { id } = await params
  const { storeId } = await searchParams

  const [research, stores] = await Promise.all([
    prisma.climateResearch.findUnique({
      where: { id },
      include: {
        questions: { orderBy: { order: 'asc' } },
        responses: {
          where: storeId ? { storeId } : undefined,
          include: { answers: true, store: { select: { name: true } } },
          orderBy: { submittedAt: 'desc' },
        },
      },
    }),
    prisma.store.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
  ])

  if (!research) notFound()

  // Store response grid data
  const allStores = await prisma.store.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })

  const responseCounts = await prisma.climateResponse.groupBy({
    by: ['storeId'],
    where: { researchId: research.id },
    _count: { id: true },
  })

  const storeResponseCounts = Object.fromEntries(
    responseCounts.map((r) => [r.storeId ?? '__null__', r._count.id])
  )

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/clima" className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-slate-800">{research.title}</h1>
            <p className="text-sm text-slate-500">{research.responses.length} resposta{research.responses.length !== 1 ? 's' : ''}{storeId ? ' (filtrado por loja)' : ''}</p>
          </div>
        </div>

        {/* Store filter */}
        {stores.length > 0 && (
          <form method="GET" className="flex gap-2 shrink-0">
            <select
              name="storeId"
              defaultValue={storeId ?? ''}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-brand bg-white"
            >
              <option value="">Todas as lojas</option>
              {stores.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <button type="submit" className="bg-brand text-white text-sm px-4 py-2 rounded-lg hover:bg-brand/90 transition-colors">
              Filtrar
            </button>
            {storeId && (
              <Link href={`/admin/clima/${id}`} className="text-sm text-slate-500 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50">
                Limpar
              </Link>
            )}
          </form>
        )}
      </div>

      {/* Store response grid */}
      {allStores.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-100 p-5 mb-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Respostas por Loja</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {allStores.map((store) => {
              const count = storeResponseCounts[store.id] ?? 0
              const hasNoResponse = count === 0
              return (
                <div
                  key={store.id}
                  className={`rounded-lg p-3 border ${
                    hasNoResponse ? 'border-rose-200 bg-rose-50' : 'border-slate-100 bg-white'
                  }`}
                >
                  <p className="text-xs font-medium text-slate-700 truncate">{store.name}</p>
                  {hasNoResponse ? (
                    <p className="text-xs font-bold text-rose-600 mt-1">⚠ Sem respostas</p>
                  ) : (
                    <p className="text-lg font-bold text-slate-800 mt-0.5">{count}</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {research.responses.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <p>Nenhuma resposta{storeId ? ' para esta loja' : ' ainda'}.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {research.questions.map((question) => {
            const questionAnswers = research.responses.flatMap((r) =>
              r.answers.filter((a) => a.questionId === question.id)
            )

            if (question.type === 'SCALE') {
              const nums = questionAnswers.map((a) => Number(a.value)).filter((n) => !isNaN(n))
              const avg = average(nums)
              const distribution: Record<number, number> = {}
              for (let i = question.scaleMin!; i <= question.scaleMax!; i++) distribution[i] = 0
              nums.forEach((n) => { if (n in distribution) distribution[n]++ })
              const maxCount = Math.max(...Object.values(distribution), 1)

              return (
                <div key={question.id} className="bg-white rounded-xl border border-slate-200 p-5">
                  <p className="font-medium text-slate-800 mb-1">{question.text}</p>
                  <p className="text-2xl font-bold text-brand mb-4">
                    {avg ?? '—'}
                    <span className="text-sm font-normal text-slate-400 ml-1">/ {question.scaleMax} média</span>
                  </p>
                  <div className="flex items-end gap-2 h-20">
                    {Object.entries(distribution).map(([val, count]) => (
                      <div key={val} className="flex flex-col items-center gap-1 flex-1">
                        <span className="text-xs text-slate-500">{count}</span>
                        <div
                          className="w-full bg-brand/20 rounded-t"
                          style={{ height: `${(count / maxCount) * 100}%`, minHeight: count > 0 ? '4px' : '0' }}
                        />
                        <span className="text-xs text-slate-400">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            }

            if (question.type === 'MULTIPLE') {
              const options: string[] = Array.isArray(question.options) ? question.options as string[] : []
              const counts: Record<string, number> = {}
              options.forEach((o) => { counts[o] = 0 })
              questionAnswers.forEach((a) => { if (a.value in counts) counts[a.value]++ })
              const total = questionAnswers.length || 1

              return (
                <div key={question.id} className="bg-white rounded-xl border border-slate-200 p-5">
                  <p className="font-medium text-slate-800 mb-4">{question.text}</p>
                  <div className="space-y-2">
                    {options.map((opt) => {
                      const pct = Math.round((counts[opt] / total) * 100)
                      return (
                        <div key={opt}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-700">{opt}</span>
                            <span className="text-slate-500">{counts[opt]} ({pct}%)</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-2 bg-brand rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            }

            return (
              <div key={question.id} className="bg-white rounded-xl border border-slate-200 p-5">
                <p className="font-medium text-slate-800 mb-3">{question.text}</p>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {questionAnswers.filter((a) => a.value.trim()).map((a) => (
                    <div key={a.id} className="text-sm text-slate-600 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                      {a.value}
                    </div>
                  ))}
                  {questionAnswers.filter((a) => a.value.trim()).length === 0 && (
                    <p className="text-sm text-slate-400">Sem respostas textuais.</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
