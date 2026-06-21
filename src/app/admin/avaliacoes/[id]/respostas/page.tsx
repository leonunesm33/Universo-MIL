import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function AvaliacaoRespostasPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const assessment = await prisma.assessment.findUnique({
    where: { id },
    select: { title: true },
  })
  if (!assessment) notFound()

  const responses = await prisma.assessmentResponse.findMany({
    where: { assessmentId: id },
    orderBy: { submittedAt: 'desc' },
    include: { user: { select: { name: true, email: true, store: { select: { name: true } } } } },
  })

  return (
    <div className="max-w-4xl mx-auto">
      <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <Link href="/admin/avaliacoes" className="hover:text-slate-700">Avaliações</Link>
        <span>/</span>
        <Link href={`/admin/avaliacoes/${id}`} className="hover:text-slate-700">{assessment.title}</Link>
        <span>/</span>
        <span className="text-slate-700 font-medium">Respostas</span>
      </nav>

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-slate-800">{assessment.title}</h1>
        <p className="text-sm text-slate-500">{responses.length} resposta(s)</p>
      </div>

      {responses.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-100 p-8 text-center">
          <p className="text-slate-400 text-sm">Nenhuma resposta ainda.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-slate-500">
                <th className="px-4 py-3 text-left font-medium">Aluna</th>
                <th className="px-4 py-3 text-left font-medium hidden md:table-cell">Loja</th>
                <th className="px-4 py-3 text-center font-medium">Nota</th>
                <th className="px-4 py-3 text-center font-medium">Resultado</th>
                <th className="px-4 py-3 text-left font-medium hidden lg:table-cell">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {responses.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-700">{r.user.name}</p>
                    <p className="text-xs text-slate-400">{r.user.email}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-slate-500">
                    {r.user.store?.name ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="font-semibold text-slate-700">
                      {r.score != null ? `${r.score}%` : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      r.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                    }`}>
                      {r.passed == null ? '—' : r.passed ? 'Aprovada' : 'Reprovada'}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-slate-400">
                    {r.submittedAt.toLocaleString('pt-BR')}
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
