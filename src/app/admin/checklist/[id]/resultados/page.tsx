import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ storeId?: string; page?: string }>
}

const PAGE_SIZE = 20

export default async function ChecklistResultadosPage({ params, searchParams }: Props) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/homepage')

  const { id } = await params
  const { storeId, page: pageStr } = await searchParams
  const page = Math.max(1, parseInt(pageStr ?? '1', 10))

  const [template, stores] = await Promise.all([
    prisma.checklistTemplate.findUnique({ where: { id }, select: { id: true, title: true } }),
    prisma.store.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
  ])

  if (!template) notFound()

  const where = {
    templateId: id,
    ...(storeId ? { storeId } : {}),
  }

  const [total, responses] = await Promise.all([
    prisma.checklistResponse.count({ where }),
    prisma.checklistResponse.findMany({
      where,
      orderBy: { submittedAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        responder: { select: { name: true } },
        store: { select: { name: true } },
        items: {
          where: { ok: false },
          include: { item: { select: { text: true } } },
        },
      },
    }),
  ])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  function buildUrl(p: number) {
    const sp = new URLSearchParams()
    if (storeId) sp.set('storeId', storeId)
    if (p > 1) sp.set('page', String(p))
    const q = sp.toString()
    return `/admin/checklist/${id}/resultados${q ? `?${q}` : ''}`
  }

  return (
    <div className="max-w-5xl mx-auto">
      <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <Link href="/admin/checklist" className="hover:text-slate-700">Checklist</Link>
        <span>/</span>
        <span className="text-slate-700 font-medium">{template.title} — Resultados</span>
      </nav>

      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">{template.title}</h1>
          <p className="text-sm text-slate-500 mt-0.5">{total} resposta{total !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Store filter */}
      {stores.length > 0 && (
        <form method="GET" className="flex gap-2 mb-4">
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
            <Link href={`/admin/checklist/${id}/resultados`} className="text-sm text-slate-500 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50">
              Limpar
            </Link>
          )}
        </form>
      )}

      {responses.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-100 p-8 text-center">
          <p className="text-slate-400 text-sm">Nenhuma resposta encontrada.</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 bg-slate-50">
                  <th className="px-4 py-3 text-left font-medium">Loja</th>
                  <th className="px-4 py-3 text-left font-medium hidden md:table-cell">Respondente</th>
                  <th className="px-4 py-3 text-center font-medium">Score</th>
                  <th className="px-4 py-3 text-center font-medium">NC</th>
                  <th className="px-4 py-3 text-left font-medium hidden lg:table-cell">Data</th>
                  <th className="px-4 py-3 w-24" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {responses.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-slate-700">{r.store?.name ?? r.storeName}</td>
                    <td className="px-4 py-3 text-slate-500 hidden md:table-cell">{r.responder.name}</td>
                    <td className="px-4 py-3 text-center">
                      {r.score != null ? (
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          r.score >= 80 ? 'bg-green-100 text-green-700' :
                          r.score >= 60 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-600'
                        }`}>{r.score}%</span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {r.items.length > 0 ? (
                        <span className="text-xs font-semibold text-red-600">{r.items.length}</span>
                      ) : (
                        <span className="text-xs text-green-600">0</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-400 hidden lg:table-cell text-xs">
                      {r.submittedAt.toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/checklist/resposta/${r.id}`}
                        className="text-xs text-brand hover:text-brand/80 font-medium"
                      >
                        Ver / PDF
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              {page > 1 && (
                <Link href={buildUrl(page - 1)} className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 hover:bg-slate-50">
                  ← Anterior
                </Link>
              )}
              <span className="text-sm text-slate-500">
                Página {page} de {totalPages}
              </span>
              {page < totalPages && (
                <Link href={buildUrl(page + 1)} className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 hover:bg-slate-50">
                  Próxima →
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
