import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PrintButton } from './PrintButton'

export default async function ChecklistRespostaPage({
  params,
}: {
  params: Promise<{ responseId: string }>
}) {
  const { responseId } = await params

  const response = await prisma.checklistResponse.findUnique({
    where: { id: responseId },
    include: {
      template: { select: { title: true } },
      responder: { select: { name: true } },
      store: { select: { name: true } },
      items: {
        include: { item: true },
        orderBy: { item: { order: 'asc' } },
      },
    },
  })

  if (!response) notFound()

  const nc = response.items.filter((a) => !a.ok)
  const ok = response.items.filter((a) => a.ok)

  return (
    <div className="max-w-3xl mx-auto">
      <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6 print:hidden">
        <Link href="/admin/checklist" className="hover:text-slate-700">Checklist</Link>
        <span>/</span>
        <span className="text-slate-700 font-medium">Resposta #{responseId.slice(0, 8)}</span>
      </nav>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 mb-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">{response.template.title}</h1>
            <p className="text-sm text-slate-500 mt-1">
              {response.store?.name ?? response.storeName}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Respondido por {response.responder.name} em {response.submittedAt.toLocaleString('pt-BR')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {response.score != null && (
              <div className={`text-center px-4 py-2 rounded-xl ${
                response.score >= 80 ? 'bg-green-100 text-green-700' :
                response.score >= 60 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-600'
              }`}>
                <p className="text-2xl font-bold">{response.score}%</p>
                <p className="text-xs">conformidade</p>
              </div>
            )}
            <PrintButton />
          </div>
        </div>
      </div>

      {nc.length > 0 && (
        <div className="bg-white rounded-xl border border-red-100 shadow-sm p-6 mb-4">
          <h2 className="text-sm font-semibold text-red-700 mb-3">Itens Não Conformes ({nc.length})</h2>
          <div className="space-y-2">
            {nc.map((a) => (
              <div key={a.id} className="rounded-lg bg-red-50 border border-red-100 p-3">
                <p className="text-sm text-slate-700 font-medium">{a.item.text}</p>
                {a.item.category && <p className="text-xs text-slate-400 mt-0.5">{a.item.category}</p>}
                {a.note && <p className="text-xs text-red-700 mt-1 italic">{a.note}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 mb-4">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Itens Conformes ({ok.length})</h2>
        <div className="space-y-1">
          {ok.map((a) => (
            <div key={a.id} className="flex items-center gap-2 text-sm text-slate-600 py-1">
              <span className="text-green-500 shrink-0">✓</span>
              {a.item.text}
            </div>
          ))}
        </div>
      </div>

      {response.notes && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-2">Observações Gerais</h2>
          <p className="text-sm text-slate-600">{response.notes}</p>
        </div>
      )}
    </div>
  )
}
