import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ToggleChecklistButton } from './ToggleChecklistButton'

export const metadata = { title: 'Admin — Checklist' }

export default async function AdminChecklistPage() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/homepage')

  const templates = await prisma.checklistTemplate.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { items: true, responses: true } } },
  })

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Checklists</h1>
          <p className="text-sm text-slate-500 mt-1">{templates.length} template{templates.length !== 1 ? 's' : ''}</p>
        </div>
        <Link
          href="/admin/checklist/nova"
          className="inline-flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand/90 transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Novo Checklist
        </Link>
      </div>

      {templates.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-100 p-8 text-center">
          <p className="text-slate-400 text-sm">Nenhum template criado ainda.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500 text-left bg-slate-50">
                <th className="px-4 py-3 font-medium">Título</th>
                <th className="px-4 py-3 font-medium">Itens</th>
                <th className="px-4 py-3 font-medium">Respostas</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {templates.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {t.title}
                    {t.description && <p className="text-xs text-slate-400 font-normal mt-0.5">{t.description}</p>}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{t._count.items}</td>
                  <td className="px-4 py-3 text-slate-600">{t._count.responses}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                      t.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {t.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/checklist/${t.id}/editar`}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Editar
                      </Link>
                      <ToggleChecklistButton id={t.id} status={t.status} />
                      {t._count.responses > 0 && (
                        <Link
                          href={`/admin/checklist/${t.id}/resultados`}
                          className="text-xs text-brand hover:text-brand/80 font-medium px-2 py-1 border border-brand/20 rounded hover:bg-brand/5 transition-colors"
                        >
                          Ver resultados
                        </Link>
                      )}
                    </div>
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
