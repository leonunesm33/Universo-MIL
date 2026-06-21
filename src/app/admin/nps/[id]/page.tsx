import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'

interface Props { params: Promise<{ id: string }> }

export const metadata = { title: 'Admin — Resultados Satisfação da Equipe' }

function npsCategory(score: number) {
  if (score >= 9) return { label: 'Promotor', color: 'bg-green-100 text-green-700' }
  if (score >= 7) return { label: 'Neutro', color: 'bg-amber-100 text-amber-700' }
  return { label: 'Detrator', color: 'bg-red-100 text-red-700' }
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
  const promoters = scores.filter((s) => s >= 9).length
  const neutrals = scores.filter((s) => s >= 7 && s <= 8).length
  const detractors = scores.filter((s) => s <= 6).length
  const nps = scores.length > 0
    ? Math.round(((promoters - detractors) / scores.length) * 100)
    : null
  const avg = scores.length > 0
    ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
    : null

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

      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500">NPS</p>
          <p className={`text-3xl font-bold mt-1 ${
            nps === null ? 'text-slate-400' : nps >= 50 ? 'text-green-600' : nps >= 0 ? 'text-amber-600' : 'text-red-600'
          }`}>{nps !== null ? nps : '—'}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500">Média</p>
          <p className="text-3xl font-bold text-slate-700 mt-1">{avg ?? '—'}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-green-600">Promotores</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{promoters}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-red-500">Detratores</p>
          <p className="text-3xl font-bold text-red-500 mt-1">{detractors}</p>
        </div>
      </div>

      {scores.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
          <p className="text-sm font-medium text-slate-700 mb-4">Distribuição de Notas</p>
          <div className="flex items-end gap-2 h-24">
            {Object.entries(distribution).map(([val, count]) => {
              const n = Number(val)
              const color = n >= 9 ? 'bg-green-400' : n >= 7 ? 'bg-amber-400' : 'bg-red-400'
              return (
                <div key={val} className="flex flex-col items-center gap-1 flex-1">
                  <span className="text-xs text-slate-500">{count || ''}</span>
                  <div
                    className={`w-full ${color} rounded-t`}
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
                <th className="px-4 py-3 font-medium">Categoria</th>
                <th className="px-4 py-3 font-medium hidden lg:table-cell">Comentário</th>
                <th className="px-4 py-3 font-medium">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {campaign.responses.map((r) => {
                const cat = npsCategory(r.score)
                return (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">{r.responder.name}</td>
                    <td className="px-4 py-3 text-slate-600">{r.leader?.name ?? '—'}</td>
                    <td className="px-4 py-3 font-bold text-slate-700">{r.score}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${cat.color}`}>
                        {cat.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 max-w-xs truncate hidden lg:table-cell">{r.comment || '—'}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(new Date(r.submittedAt))}
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
