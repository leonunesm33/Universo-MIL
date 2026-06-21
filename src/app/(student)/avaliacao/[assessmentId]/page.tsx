import { auth } from '@/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { AssessmentForm } from './AssessmentForm'

export const metadata = { title: 'Avaliação' }

export default async function AvaliacaoPage({
  params,
}: {
  params: Promise<{ assessmentId: string }>
}) {
  const session = await auth()
  if (!session) redirect('/login')

  const { assessmentId } = await params

  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId, status: 'ACTIVE' },
    include: {
      module: { select: { title: true, course: { select: { name: true, slug: true } } } },
      questions: {
        orderBy: { order: 'asc' },
        include: { options: { orderBy: { order: 'asc' } } },
      },
    },
  })

  if (!assessment) notFound()

  const existingResponse = await prisma.assessmentResponse.findFirst({
    where: { userId: session.user.id, assessmentId },
    orderBy: { submittedAt: 'desc' },
  })

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8">
        <p className="text-white/40 text-xs mb-2">
          {assessment.module?.course.name} › {assessment.module?.title}
        </p>
        <h1 className="text-2xl font-bold text-white">{assessment.title}</h1>
        <p className="text-white/50 text-sm mt-1">
          {assessment.questions.length} questão{assessment.questions.length !== 1 ? 'ões' : ''}
          {assessment.passingScore != null ? ` · Nota mínima: ${assessment.passingScore}%` : ''}
        </p>
      </div>

      {existingResponse ? (
        <div className={`rounded-2xl border p-8 text-center ${
          existingResponse.passed ? 'border-green-500/20 bg-green-500/5' : 'border-red-500/20 bg-red-500/5'
        }`}>
          <div className="text-5xl mb-4">{existingResponse.passed ? '🎉' : '😔'}</div>
          <h2 className={`text-2xl font-bold mb-2 ${existingResponse.passed ? 'text-green-400' : 'text-red-400'}`}>
            {existingResponse.passed ? 'Aprovado!' : 'Reprovado'}
          </h2>
          <p className="text-white/60 text-lg mb-1">
            Sua nota: <strong className="text-white">{existingResponse.score ?? 0}%</strong>
          </p>
          {assessment.passingScore != null && (
            <p className="text-white/40 text-sm">Nota mínima: {assessment.passingScore}%</p>
          )}
          {assessment.module?.course.slug && (
            <a
              href={`/curso/${assessment.module.course.slug}`}
              className="inline-block mt-6 bg-white/10 hover:bg-white/15 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors"
            >
              Voltar ao curso
            </a>
          )}
        </div>
      ) : (
        <AssessmentForm
          assessmentId={assessmentId}
          questions={assessment.questions.map((q) => ({
            id: q.id,
            text: q.text,
            type: q.type,
            options: q.options.map((o) => ({ id: o.id, text: o.text })),
          }))}
          passingScore={assessment.passingScore}
          courseSlug={assessment.module?.course.slug ?? null}
        />
      )}
    </div>
  )
}
