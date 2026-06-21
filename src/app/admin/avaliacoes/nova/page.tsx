import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { createAssessment } from '@/app/admin/actions/assessments'
import { QuestionBuilder } from '../QuestionBuilder'
import { CourseModuleSelector } from './CourseModuleSelector'

export default async function NovaAvaliacaoPage() {
  const courses = await prisma.course.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      modules: {
        orderBy: { order: 'asc' },
        select: { id: true, title: true },
      },
    },
  })

  return (
    <div className="max-w-2xl mx-auto">
      <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <Link href="/admin/avaliacoes" className="hover:text-slate-700">Avaliações</Link>
        <span>/</span>
        <span className="text-slate-700 font-medium">Nova Avaliação</span>
      </nav>

      <form action={createAssessment} className="space-y-5">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700 pb-3 border-b border-slate-100">
            Informações
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              Título *
            </label>
            <input
              name="title"
              required
              placeholder="Ex: Avaliação de Onboarding"
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand"
            />
          </div>

          <CourseModuleSelector courses={courses} />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Tipo
              </label>
              <select
                name="type"
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
                placeholder="ex: 70"
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Questões</h2>
          <QuestionBuilder />
        </div>

        <div className="flex justify-end gap-3">
          <Link
            href="/admin/avaliacoes"
            className="px-4 py-2.5 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            className="px-6 py-2.5 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-brand/90 transition-colors"
          >
            Criar Avaliação
          </button>
        </div>
      </form>
    </div>
  )
}
