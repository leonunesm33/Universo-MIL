import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { toggleAssessmentStatus } from '@/app/admin/actions/assessments'

export default async function AvaliacoesPage() {
  const assessments = await prisma.assessment.findMany({
    include: {
      module: { include: { course: { select: { name: true } } } },
      lesson: {
        include: { module: { include: { course: true } } },
      },
      _count: { select: { responses: true, questions: true } },
    },
    orderBy: { title: 'asc' },
  })

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Avaliações</h1>
          <p className="text-sm text-slate-500 mt-1">
            {assessments.length} avaliação(ões) cadastrada(s)
          </p>
        </div>
        <Link
          href="/admin/avaliacoes/nova"
          className="inline-flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand/90 transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nova Avaliação
        </Link>
      </div>

      {assessments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 text-center">
          <p className="text-slate-400 text-sm">Nenhuma avaliação criada ainda.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wide px-5 py-3">
                  Avaliação
                </th>
                <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wide px-5 py-3 hidden md:table-cell">
                  Curso
                </th>
                <th className="text-center text-xs font-medium text-slate-400 uppercase tracking-wide px-5 py-3">
                  Questões
                </th>
                <th className="text-center text-xs font-medium text-slate-400 uppercase tracking-wide px-5 py-3">
                  Respostas
                </th>
                <th className="text-center text-xs font-medium text-slate-400 uppercase tracking-wide px-5 py-3">
                  Status
                </th>
                <th className="px-5 py-3 w-28" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {assessments.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3">
                    <p className="text-sm font-medium text-slate-700">{a.title}</p>
                    <p className="text-xs text-slate-400 truncate max-w-[200px]">
                      {a.module?.title ?? a.lesson?.title ?? '—'}
                    </p>
                  </td>
                  <td className="px-5 py-3 hidden md:table-cell">
                    <p className="text-sm text-slate-600 truncate max-w-[200px]">
                      {a.module?.course.name ?? a.lesson?.module.course.name ?? '—'}
                    </p>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className="text-sm text-slate-600">{a._count.questions}</span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <Link
                      href={`/admin/avaliacoes/${a.id}/respostas`}
                      className="text-sm text-brand hover:text-brand/80 font-medium"
                    >
                      {a._count.responses}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <form action={toggleAssessmentStatus.bind(null, a.id, a.status)}>
                      <button
                        type="submit"
                        className={`text-xs px-2 py-0.5 rounded-full font-medium transition-colors ${
                          a.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-600'
                            : 'bg-slate-100 text-slate-600 hover:bg-green-100 hover:text-green-700'
                        }`}
                        title={a.status === 'ACTIVE' ? 'Clique para desativar' : 'Clique para ativar'}
                      >
                        {a.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                      </button>
                    </form>
                  </td>
                  <td className="px-5 py-3">
                    <Link
                      href={`/admin/avaliacoes/${a.id}`}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
