'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { toast } from 'sonner'

function ConviteContent() {
  const params = useSearchParams()
  const router = useRouter()
  const token = params.get('token') ?? ''

  const [state, setState] = useState<'loading' | 'form' | 'invalid'>('loading')
  const [info, setInfo] = useState<{ name: string } | null>(null)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!token) { setState('invalid'); return }
    fetch(`/api/convite?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.valid) { setInfo({ name: data.name }); setState('form') }
        else setState('invalid')
      })
      .catch(() => setState('invalid'))
  }, [token])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 6) { toast.error('A senha deve ter pelo menos 6 caracteres.'); return }
    if (password !== confirm) { toast.error('As senhas não coincidem.'); return }
    setSubmitting(true)
    const res = await fetch('/api/convite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    })
    const data = await res.json()
    if (!res.ok) { toast.error(data.error ?? 'Erro ao ativar convite.'); setSubmitting(false); return }

    const result = await signIn('magic-link', { token: data.sessionToken, redirect: false })
    setSubmitting(false)
    if (result?.error) { router.push('/login'); return }
    toast.success('Bem-vinda à Universo Mil!')
    router.push('/homepage')
  }

  const inputClass =
    'w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg pl-10 pr-4 py-3 text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-brand'

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black px-4">
      <div className="mb-8 text-center select-none">
        <p className="text-[9px] font-semibold tracking-[0.45em] text-[#555] uppercase mb-2">Universidade</p>
        <div className="flex items-center justify-center gap-1">
          <svg width="52" height="44" viewBox="0 0 52 44" fill="none">
            <path d="M2 42V2L18 28L26 14L34 28L50 2V42" stroke="#EC55B5" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <svg width="18" height="44" viewBox="0 0 18 44" fill="none">
            <line x1="2" y1="2" x2="16" y2="2" stroke="#EC55B5" strokeWidth="4.5" strokeLinecap="round"/>
            <line x1="9" y1="2" x2="9" y2="42" stroke="#EC55B5" strokeWidth="4.5" strokeLinecap="round"/>
            <line x1="2" y1="42" x2="16" y2="42" stroke="#EC55B5" strokeWidth="4.5" strokeLinecap="round"/>
          </svg>
          <svg width="38" height="44" viewBox="0 0 38 44" fill="none">
            <path d="M6 2V42H36" stroke="#EC55B5" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      <div className="w-full max-w-[440px]">
        <div className="bg-[#111] rounded-2xl overflow-hidden shadow-2xl">
          <div className="px-10 pt-8 pb-0">
            {state === 'form' && info && (
              <h1 className="text-center text-white/80 font-medium text-[15px]">
                Olá, {info.name.split(' ')[0]}! Crie sua senha
              </h1>
            )}
            {state === 'loading' && (
              <h1 className="text-center text-white/80 font-medium text-[15px]">Verificando convite…</h1>
            )}
            {state === 'invalid' && (
              <h1 className="text-center text-white/80 font-medium text-[15px]">Convite inválido</h1>
            )}
          </div>

          <div className="mt-5 h-[2px] bg-gradient-to-r from-transparent via-brand to-transparent" />

          <div className="px-10 pt-6 pb-8">
            {state === 'loading' && (
              <div className="flex justify-center py-6">
                <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {state === 'invalid' && (
              <div className="text-center py-4">
                <p className="text-red-400 text-sm mb-3">
                  Este convite é inválido ou já foi utilizado.
                </p>
                <a href="/login" className="text-xs text-[#666] hover:text-[#aaa] transition-colors">
                  ← Ir para o login
                </a>
              </div>
            )}

            {state === 'form' && (
              <form onSubmit={handleSubmit} className="space-y-3">
                <p className="text-xs text-[#777] text-center mb-4">
                  Defina uma senha para acessar a plataforma.
                </p>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555] pointer-events-none">
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                    </svg>
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Criar senha (mín. 6 caracteres)"
                    required
                    minLength={6}
                    className={inputClass}
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555] pointer-events-none">
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                    </svg>
                  </span>
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Confirmar senha"
                    required
                    className={inputClass}
                  />
                </div>
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-brand hover:bg-brand-dark disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-colors text-sm"
                  >
                    {submitting ? 'Ativando acesso…' : 'Criar meu acesso'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ConvitePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-8 h-8 border-2 border-[#EC55B5] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ConviteContent />
    </Suspense>
  )
}
