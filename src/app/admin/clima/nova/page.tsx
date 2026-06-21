import Link from 'next/link'
import { createClimateResearch } from '@/app/admin/actions/clima'
import { ClimateQuestionBuilder } from '../ClimateQuestionBuilder'

const inputClass = 'w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand bg-white'
const labelClass = 'block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5'

export default function NovaPesquisaClimaPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <Link href="/admin/clima" className="hover:text-slate-700">Pesquisa de Clima</Link>
        <span>/</span>
        <span className="text-slate-700 font-medium">Nova Pesquisa</span>
      </nav>

      <form action={createClimateResearch} className="space-y-5">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700 pb-3 border-b border-slate-100">
            Informações
          </h2>

          <div>
            <label className={labelClass}>Título *</label>
            <input name="title" required placeholder="Ex: Pesquisa de Clima — Junho 2026" className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Descrição</label>
            <textarea name="description" rows={2} placeholder="Instruções para as participantes..." className={`${inputClass} resize-none`} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>URL do arquivo</label>
              <input name="fileUrl" type="url" placeholder="https://..." className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Link externo</label>
              <input name="linkUrl" type="url" placeholder="https://..." className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Início da disponibilidade</label>
              <input name="startDate" type="date" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Fim da disponibilidade</label>
              <input name="endDate" type="date" className={inputClass} />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input type="hidden" name="isAnonymous" value="false" />
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="isAnonymous"
                value="true"
                defaultChecked
                className="accent-brand"
              />
              <span className="text-sm text-slate-700">Pesquisa anônima</span>
            </label>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Perguntas</h2>
          <ClimateQuestionBuilder />
        </div>

        <div className="flex justify-end gap-3">
          <Link href="/admin/clima" className="px-4 py-2.5 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">
            Cancelar
          </Link>
          <button type="submit" className="px-6 py-2.5 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-brand/90 transition-colors">
            Criar Pesquisa
          </button>
        </div>
      </form>
    </div>
  )
}
