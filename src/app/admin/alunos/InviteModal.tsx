'use client'

import { useState, useRef } from 'react'
import { toast } from 'sonner'
import { inviteStudent } from '@/app/admin/actions/users'

interface Store {
  id: string
  name: string
  code: string | null
}

export function InviteModal({ stores }: { stores: Store[] }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    try {
      await inviteStudent(formData)
      toast.success('Convite enviado com sucesso!')
      setOpen(false)
      formRef.current?.reset()
    } catch {
      toast.error('Erro ao enviar convite.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:border-brand bg-white'

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 bg-brand hover:bg-brand/90 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/>
          <line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>
        </svg>
        Convidar aluna
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-base font-semibold text-slate-800">Convidar nova aluna</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <form ref={formRef} action={handleSubmit} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  Nome completo <span className="text-red-500">*</span>
                </label>
                <input name="name" required placeholder="Nome da aluna" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  E-mail <span className="text-red-500">*</span>
                </label>
                <input name="email" type="email" required placeholder="email@exemplo.com" className={inputClass} />
              </div>
              {stores.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                    Loja <span className="text-slate-400 font-normal">(opcional)</span>
                  </label>
                  <select name="storeId" className={inputClass}>
                    <option value="">Sem loja</option>
                    {stores.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}{s.code ? ` (${s.code})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  Grupo
                </label>
                <select name="role" className={inputClass} defaultValue="COLABORADOR">
                  <option value="ADMIN">Admin</option>
                  <option value="COLABORADOR">Colaborador</option>
                  <option value="GERENTE">Gerente</option>
                  <option value="SUPERVISAO">Supervisão</option>
                </select>
              </div>
              <p className="text-xs text-slate-400">
                Um e-mail com link de ativação será enviado para a aluna. O link expira em 72 horas.
              </p>
              <div className="flex justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 transition-colors rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-brand hover:bg-brand/90 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  {loading ? 'Enviando…' : 'Enviar convite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
