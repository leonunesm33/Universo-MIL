import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { updateNPSCampaign } from '@/app/admin/actions/nps'
import { NPSQuestionBuilder } from '../../NPSQuestionBuilder'
import { NPSLeaderInput } from '../../NPSLeaderInput'

const inputClass = 'w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand bg-white'
const labelClass = 'block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5'

export default async function EditarNPSPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const campaign = await prisma.nPSCampaign.findUnique({
    where: { id },
    include: {
      questions: { orderBy: { order: 'asc' } },
      leaders: { orderBy: { name: 'asc' } },
      _count: { select: { responses: true } },
    },
  })
  if (!campaign) notFound()

  const initialQuestions = campaign.questions.map((q) => ({
    text: q.text,
    type: q.type,
    order: q.order,
    options: Array.isArray(q.options) ? (q.options as string[]) : null,
  }))

  const initialLeaders = campaign.leaders.map((l) => ({ name: l.name }))

  return (
    <div className="max-w-2xl mx-auto">
      <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <Link href="/admin/nps" className="hover:text-slate-700">Satisfação da Equipe</Link>
        <span>/</span>
        <span className="text-slate-700 font-medium truncate">{campaign.title}</span>
      </nav>

      <form action={updateNPSCampaign.bind(null, id)} className="space-y-5">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700 pb-3 border-b border-slate-100">Informações</h2>

          {campaign._count.responses > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
              <p className="text-sm text-amber-800">
                Esta campanha tem {campaign._count.responses} resposta(s). Editar perguntas pode afetar relatórios.
              </p>
            </div>
          )}

          <div>
            <label className={labelClass}>Título *</label>
            <input name="title" required defaultValue={campaign.title} className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Descrição</label>
            <textarea name="description" rows={3} defaultValue={campaign.description ?? ''} className={`${inputClass} resize-none`} />
          </div>

          <div>
            <label className={labelClass}>Data Limite para Resposta</label>
            <input
              name="deadlineDate"
              type="date"
              defaultValue={campaign.deadlineDate ? new Date(campaign.deadlineDate).toISOString().split('T')[0] : ''}
              className={inputClass}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Líderes para Avaliação</h2>
          <NPSLeaderInput initial={initialLeaders} />
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Perguntas Personalizadas</h2>
          <NPSQuestionBuilder initial={initialQuestions} />
        </div>

        <div className="flex justify-end gap-3">
          <Link href="/admin/nps" className="px-4 py-2.5 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">
            Cancelar
          </Link>
          <button type="submit" className="px-6 py-2.5 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-brand/90 transition-colors">
            Salvar Alterações
          </button>
        </div>
      </form>
    </div>
  )
}
