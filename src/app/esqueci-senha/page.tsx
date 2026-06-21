'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'

async function requestReset(email: string) {
  const res = await fetch('/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
  return res.ok
}

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await requestReset(email)
    setLoading(false)
    setSent(true)
    toast.success('Se o e-mail existir, você receberá as instruções.')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black px-4">
      {/* Logo */}
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
            <h1 className="text-center text-white/80 font-medium text-[15px]">
              Recuperar acesso
            </h1>
            <p className="text-center text-xs text-[#666] mt-1.5">
              Informe seu e-mail e enviaremos um link para redefinir sua senha.
            </p>
          </div>

          <div className="mt-5 h-[2px] bg-gradient-to-r from-transparent via-brand to-transparent" />

          <div className="px-10 pt-6 pb-8">
            {sent ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center mx-auto mb-3">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 text-brand" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.81 19.79 19.79 0 010 .18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91"/>
                    <path d="M20 4L9 15l-4-4"/>
                  </svg>
                </div>
                <p className="text-white/70 text-sm">
                  Verifique seu e-mail e clique no link que enviamos.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555] pointer-events-none">
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Seu e-mail"
                    required
                    autoComplete="email"
                    className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg pl-10 pr-4 py-3 text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-brand"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand hover:bg-brand-dark disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-colors text-sm"
                >
                  {loading ? 'Enviando…' : 'Enviar link de recuperação'}
                </button>
              </form>
            )}

            <div className="mt-5 text-center">
              <Link href="/login" className="text-xs text-[#666] hover:text-[#aaa] transition-colors">
                ← Voltar ao login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
