import { auth } from '@/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const metadata = { title: 'Detalhes da Resposta — Checklist' }

export default async function ChecklistRespostaPage({
  params,
}: {
  params: Promise<{ responseId: string }>
}) {
  const session = await auth()
  if (!session) redirect('/login')

  const { responseId } = await params

  const response = await prisma.checklistResponse.findUnique({
    where: { id: responseId },
    include: {
      template: { select: { title: true } },
      items: {
        include: { item: { select: { text: true, category: true, order: true } } },
        orderBy: { item: { order: 'asc' } },
      },
    },
  })

  if (!response || response.responderId !== session.user.id) notFound()

  const score = response.score
  const scoreColor = score === null ? 'text-white/40' : score >= 80 ? 'text-emerald-400' : score >= 60 ? 'text-yellow-400' : 'text-red-400'

  const grouped = response.items.reduce<Record<string, typeof response.items>>((acc, item) => {
    const key = item.item.category ?? 'Geral'
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {})

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-6">
        <Link href="/checklist" className="text-xs text-white/40 hover:text-white/60 transition-colors">
          ← Voltar ao Checklist
        </Link>
        <h1 className="text-2xl font-bold text-white mt-3">{response.template.title}</h1>
        <div className="flex flex-wrap items-center gap-4 mt-2">
          <p className="text-white/60 text-sm">Loja: {response.storeName}</p>
          <p className="text-white/60 text-sm">
            Data: {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(response.submittedAt))}
          </p>
          <p className={`text-lg font-bold ${scoreColor}`}>
            {score !== null ? `${Math.round(score)}%` : '—'} de conformidade
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {Object.entries(grouped).map(([category, items]) => (
          <div key={category}>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-3">{category}</h2>
            <div className="space-y-2">
              {items.map((ai) => (
                <div
                  key={ai.id}
                  className={`rounded-xl border p-4 ${
                    ai.ok ? 'border-green-500/20 bg-green-500/5' : 'border-red-500/20 bg-red-500/5'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`mt-0.5 shrink-0 text-lg ${ai.ok ? 'text-green-400' : 'text-red-400'}`}>
                      {ai.ok ? '✓' : '✗'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm leading-snug">{ai.item.text}</p>
                      {ai.note && (
                        <p className="text-white/50 text-xs mt-1.5 italic">{ai.note}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {response.notes && (
        <div className="mt-6 bg-white/5 border border-white/10 rounded-xl p-4">
          <p className="text-xs font-semibold uppercase text-white/40 mb-2">Observações Gerais</p>
          <p className="text-white/70 text-sm">{response.notes}</p>
        </div>
      )}
    </div>
  )
}
