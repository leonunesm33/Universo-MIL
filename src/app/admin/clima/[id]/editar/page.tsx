import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { updateClimateResearch } from '@/app/admin/actions/clima'
import { ClimateQuestionBuilder } from '../../ClimateQuestionBuilder'
import { DeleteClimateButton } from '../../DeleteClimateButton'

const inputClass = 'w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand bg-white'
const labelClass = 'block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5'

export default async function EditarPesquisaClimaPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const research = await prisma.climateResearch.findUnique({
    where: { id },
    include: {
      questions: { orderBy: { order: 'asc' } },
      _count: { select: { responses: true } },
    },
  })
  if (!research) notFound()

  const initialQuestions = research.questions.map((q) => ({
    text: q.text,
    type: q.type as 'SCALE' | 'MULTIPLE' | 'TEXT',
    order: q.order,
    required: q.required,
    scaleMin: q.scaleMin ?? 1,
    scaleMax: q.scaleMax ?? 5,
    options: Array.isArray(q.options) ? (q.options as string[]) : [],
  }))

  return (
    <div className="max-w-2xl mx-auto">
      <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <Link href="/admin/clima" className="hover:text-slate-700">Pesquisa de Clima</Link>
        <span>/</span>
        <span className="text-slate-700 font-medium truncate">{research.title}</span>
      </nav>

      <form action={updateClimateResearch.bind(null, id)} className="space-y-5">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-700">Informações</h2>
            <DeleteClimateButton id={id} />
          </div>

          {research._count.responses > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
              <p className="text-sm text-amber-800">
                Esta pesquisa tem {research._count.responses} resposta(s). Editar as perguntas pode afetar relatórios existentes.
              </p>
            </div>
          )}

          <div>
            <label className={labelClass}>Título *</label>
            <input name="title" required defaultValue={research.title} className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Descrição</label>
            <textarea name="description" rows={2} defaultValue={research.description ?? ''} className={`${inputClass} resize-none`} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>URL do arquivo</label>
              <input name="fileUrl" type="url" defaultValue={research.fileUrl ?? ''} placeholder="https://..." className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Link externo</label>
              <input name="linkUrl" type="url" defaultValue={research.linkUrl ?? ''} placeholder="https://..." className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Início da disponibilidade</label>
              <input
                name="startDate"
                type="date"
                defaultValue={research.startDate ? new Date(research.startDate).toISOString().split('T')[0] : ''}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Fim da disponibilidade</label>
              <input
                name="endDate"
                type="date"
                defaultValue={research.endDate ? new Date(research.endDate).toISOString().split('T')[0] : ''}
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input type="hidden" name="isAnonymous" value="false" />
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="isAnonymous"
                value="true"
                defaultChecked={research.isAnonymous}
                className="accent-brand"
              />
              <span className="text-sm text-slate-700">Pesquisa anônima</span>
            </label>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Perguntas</h2>
          <ClimateQuestionBuilder initial={initialQuestions} />
        </div>

        <div className="flex justify-end gap-3">
          <Link href="/admin/clima" className="px-4 py-2.5 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">
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
