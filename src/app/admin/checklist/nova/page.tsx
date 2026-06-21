import Link from 'next/link'
import { createChecklistTemplate } from '@/app/admin/actions/checklist'
import { ChecklistItemBuilder } from '../ChecklistItemBuilder'
import { FileUploadInput } from '@/components/admin/FileUploadInput'

const inputClass = 'w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand bg-white'
const labelClass = 'block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5'

export default function NovoChecklistPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <Link href="/admin/checklist" className="hover:text-slate-700">Checklist</Link>
        <span>/</span>
        <span className="text-slate-700 font-medium">Novo Template</span>
      </nav>

      <form action={createChecklistTemplate} className="space-y-5">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700 pb-3 border-b border-slate-100">
            Informações
          </h2>

          <div>
            <label className={labelClass}>Título *</label>
            <input name="title" required placeholder="Ex: Checklist de Abertura de Loja" className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Descrição</label>
            <textarea name="description" rows={2} placeholder="Instruções..." className={`${inputClass} resize-none`} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Arquivo</label>
              <FileUploadInput name="fileUrl" />
            </div>
            <div>
              <label className={labelClass}>Link externo</label>
              <input name="linkUrl" type="url" placeholder="https://..." className={inputClass} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Itens do Checklist</h2>
          <ChecklistItemBuilder />
        </div>

        <div className="flex justify-end gap-3">
          <Link href="/admin/checklist" className="px-4 py-2.5 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">
            Cancelar
          </Link>
          <button type="submit" className="px-6 py-2.5 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-brand/90 transition-colors">
            Criar Template
          </button>
        </div>
      </form>
    </div>
  )
}
