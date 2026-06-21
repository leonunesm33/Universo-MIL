import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { DeletePOPButton } from './DeletePOPButton'

export const metadata = { title: 'Admin — POP' }

export default async function AdminPOPPage() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/homepage')

  const docs = await prisma.pOPDocument.findMany({
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    include: { createdBy: { select: { name: true } } },
  })

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Procedimentos Operacionais Padrão</h1>
          <p className="text-sm text-slate-500 mt-0.5">{docs.length} documento{docs.length !== 1 ? 's' : ''}</p>
        </div>
        <Link
          href="/admin/pop/novo"
          className="inline-flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand/90 transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Novo Documento
        </Link>
      </div>

      {docs.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <p>Nenhum documento criado ainda.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500 text-left">
                <th className="px-4 py-3 font-medium">Título</th>
                <th className="px-4 py-3 font-medium">Categoria</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Criado por</th>
                <th className="px-4 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {docs.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-800">{doc.title}</td>
                  <td className="px-4 py-3 text-slate-500">{doc.category ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                      doc.status === 'PUBLISHED'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {doc.status === 'PUBLISHED' ? 'Publicado' : 'Rascunho'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{doc.createdBy?.name ?? '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/pop/${doc.id}`}
                        className="text-brand hover:text-brand/80 font-medium text-xs"
                      >
                        Editar
                      </Link>
                      <DeletePOPButton slug={doc.slug} title={doc.title} />
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
