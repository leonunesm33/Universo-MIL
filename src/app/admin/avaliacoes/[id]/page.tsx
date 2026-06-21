import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { updateAssessment } from '@/app/admin/actions/assessments'
import { QuestionBuilder } from '../QuestionBuilder'
import { AssessmentActionButtons } from './AssessmentActionButtons'

export default async function AvaliacaoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const assessment = await prisma.assessment.findUnique({
    where: { id },
    include: {
      module: { include: { course: { select: { name: true } } } },
      lesson: { include: { module: { include: { course: true } } } },
      questions: {
        orderBy: { order: 'asc' },
        include: { options: { orderBy: { order: 'asc' } } },
      },
      responses: {
        orderBy: { submittedAt: 'desc' },
        take: 5,
        include: { user: { select: { name: true } } },
      },
      _count: { select: { responses: true } },
    },
  })

  if (!assessment) notFound()

  const totalResponses = assessment._count.responses
  const passed = assessment.responses.filter((r) => r.passed === true).length

  const initialQuestions = assessment.questions.map((q) => ({
    text: q.text,
    type: q.type,
    order: q.order,
    options: q.options.map((o) => ({
      text: o.text,
      isCorrect: o.isCorrect,
      order: o.order,
    })),
  }))

  return (
    <div className="max-w-2xl mx-auto">
      <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <Link href="/admin/avaliacoes" className="hover:text-slate-700">Avaliações</Link>
        <span>/</span>
        <span className="text-slate-700 font-medium truncate">{assessment.title}</span>
      </nav>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-slate-100 p-4 text-center">
          <p className="text-2xl font-bold text-slate-800">{totalResponses}</p>
          <p className="text-xs text-slate-500 mt-1">Respostas</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{passed}</p>
          <p className="text-xs text-slate-500 mt-1">Aprovados</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-4 text-center">
          <p className="text-2xl font-bold text-slate-800">
            {assessment.passingScore != null ? `${assessment.passingScore}%` : '—'}
          </p>
          <p className="text-xs text-slate-500 mt-1">Nota mínima</p>
        </div>
      </div>

      <form action={updateAssessment.bind(null, id)} className="space-y-5">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-700">Informações</h2>
            <AssessmentActionButtons id={id} status={assessment.status} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              Título *
            </label>
            <input
              name="title"
              defaultValue={assessment.title}
              required
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              Módulo vinculado
            </label>
            <p className="text-sm text-slate-600 bg-slate-50 rounded-lg px-3 py-2.5">
              {assessment.module
                ? `${assessment.module.course.name} › ${assessment.module.title}`
                : assessment.lesson
                  ? `${assessment.lesson.module.course.name} › ${assessment.lesson.title} (legado)`
                  : '—'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Tipo
              </label>
              <select
                name="type"
                defaultValue={assessment.type}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand bg-white"
              >
                <option value="COMMON">Comum</option>
                <option value="CERT">Certificação</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Nota mínima (%)
              </label>
              <input
                name="passingScore"
                type="number"
                min={0}
                max={100}
                defaultValue={assessment.passingScore ?? ''}
                placeholder="ex: 70"
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Questões</h2>
          <QuestionBuilder initial={initialQuestions} />
        </div>

        <div className="flex justify-end gap-3">
          <Link
            href="/admin/avaliacoes"
            className="px-4 py-2.5 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50"
          >
            Voltar
          </Link>
          <button
            type="submit"
            className="px-6 py-2.5 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-brand/90 transition-colors"
          >
            Salvar Alterações
          </button>
        </div>
      </form>

      {totalResponses > 0 && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 mt-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-700">Respostas Recentes</h2>
            <Link href={`/admin/avaliacoes/${id}/respostas`} className="text-xs text-brand hover:text-brand/80 font-medium">
              Ver todas ({totalResponses})
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {assessment.responses.map((r) => (
              <div key={r.id} className="flex items-center justify-between py-2.5">
                <div>
                  <p className="text-sm text-slate-700">{r.user.name}</p>
                  <p className="text-xs text-slate-400">{r.submittedAt.toLocaleString('pt-BR')}</p>
                </div>
                <div className="flex items-center gap-2">
                  {r.score != null && (
                    <span className="text-sm font-semibold text-slate-700">{r.score}%</span>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    r.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                  }`}>
                    {r.passed ? 'Aprovado' : 'Reprovado'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
