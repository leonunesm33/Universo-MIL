import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { updateChecklistTemplate } from '@/app/admin/actions/checklist'
import { ChecklistItemBuilder } from '../../ChecklistItemBuilder'
import { DeleteChecklistButton } from '../../DeleteChecklistButton'
import { FileUploadInput } from '@/components/admin/FileUploadInput'

const inputClass = 'w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand bg-white'
const labelClass = 'block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5'

export default async function EditarChecklistPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const template = await prisma.checklistTemplate.findUnique({
    where: { id },
    include: {
      items: { orderBy: { order: 'asc' } },
      _count: { select: { responses: true } },
    },
  })
  if (!template) notFound()

  const initialItems = template.items.map((item) => ({
    text: item.text,
    category: item.category ?? '',
    order: item.order,
    required: item.required,
  }))

  return (
    <div className="max-w-2xl mx-auto">
      <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <Link href="/admin/checklist" className="hover:text-slate-700">Checklist</Link>
        <span>/</span>
        <span className="text-slate-700 font-medium truncate">{template.title}</span>
      </nav>

      <form action={updateChecklistTemplate.bind(null, id)} className="space-y-5">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-700">Informações</h2>
            <DeleteChecklistButton id={id} />
          </div>

          {template._count.responses > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
              <p className="text-sm text-amber-800">
                Este template tem {template._count.responses} resposta(s). Editar itens pode afetar relatórios.
              </p>
            </div>
          )}

          <div>
            <label className={labelClass}>Título *</label>
            <input name="title" required defaultValue={template.title} className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Descrição</label>
            <textarea name="description" rows={2} defaultValue={template.description ?? ''} className={`${inputClass} resize-none`} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Arquivo</label>
              <FileUploadInput name="fileUrl" defaultValue={template.fileUrl ?? ''} />
            </div>
            <div>
              <label className={labelClass}>Link externo</label>
              <input name="linkUrl" type="url" defaultValue={template.linkUrl ?? ''} placeholder="https://..." className={inputClass} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Itens do Checklist</h2>
          <ChecklistItemBuilder initial={initialItems} />
        </div>

        <div className="flex justify-end gap-3">
          <Link href="/admin/checklist" className="px-4 py-2.5 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">
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
