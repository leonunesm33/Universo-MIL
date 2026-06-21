import Link from 'next/link'
import { createNPSCampaign } from '@/app/admin/actions/nps'
import { NPSQuestionBuilder } from '../NPSQuestionBuilder'
import { NPSLeaderInput } from '../NPSLeaderInput'

const inputClass = 'w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand bg-white'
const labelClass = 'block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5'

export default function NovaCampanhaNPSPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <Link href="/admin/nps" className="hover:text-slate-700">Satisfação da Equipe</Link>
        <span>/</span>
        <span className="text-slate-700 font-medium">Nova Campanha</span>
      </nav>

      <form action={createNPSCampaign} className="space-y-5">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700 pb-3 border-b border-slate-100">Informações</h2>

          <div>
            <label className={labelClass}>Título da Campanha *</label>
            <input name="title" required placeholder="Ex: Satisfação — Junho 2026" className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Descrição</label>
            <textarea name="description" rows={3} placeholder="Objetivo desta pesquisa..." className={`${inputClass} resize-none`} />
          </div>

          <div>
            <label className={labelClass}>Data Limite para Resposta</label>
            <input name="deadlineDate" type="date" className={inputClass} />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Líderes para Avaliação</h2>
          <p className="text-xs text-slate-400 mb-3">Cadastre os líderes que poderão ser selecionados no início da avaliação.</p>
          <NPSLeaderInput />
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Perguntas Personalizadas</h2>
          <NPSQuestionBuilder />
        </div>

        <div className="flex justify-end gap-3">
          <Link href="/admin/nps" className="px-4 py-2.5 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">
            Cancelar
          </Link>
          <button type="submit" className="px-6 py-2.5 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-brand/90 transition-colors">
            Criar Campanha
          </button>
        </div>
      </form>
    </div>
  )
}
