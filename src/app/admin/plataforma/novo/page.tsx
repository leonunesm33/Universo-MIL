import { createCourse } from '@/app/admin/actions/content'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default function NovoCursoPage() {
  async function handleCreate(formData: FormData) {
    'use server'
    await createCourse(formData)
    redirect('/admin/plataforma')
  }

  return (
    <div className="max-w-2xl mx-auto">
      <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <Link href="/admin/plataforma" className="hover:text-slate-700">Plataforma</Link>
        <span>/</span>
        <span className="text-slate-700 font-medium">Novo Curso</span>
      </nav>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h1 className="text-xl font-bold text-slate-800 mb-6">Criar Novo Curso</h1>
        <form action={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Nome do Curso *
            </label>
            <input
              name="name"
              required
              placeholder="Ex: Atendimento ao Cliente"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Descrição
            </label>
            <textarea
              name="description"
              rows={3}
              placeholder="Descreva o objetivo do curso..."
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              URL do Banner (opcional)
            </label>
            <input
              name="banner"
              type="url"
              placeholder="https://..."
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
            >
              Criar Curso
            </button>
            <Link
              href="/admin/plataforma"
              className="text-sm text-slate-500 hover:text-slate-700 px-5 py-2 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
