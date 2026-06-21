'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'

type Mode = 'login' | 'magic'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [magicEmail, setMagicEmail] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const result = await signIn('credentials', { email, password, redirect: false })
    setLoading(false)
    if (result?.error) {
      toast.error('Credenciais incorretas. Verifique e tente novamente.')
    } else {
      router.push('/')
    }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await fetch('/api/auth/magic-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: magicEmail }),
    })
    setLoading(false)
    toast.success('Se o e-mail existir, você receberá o link de acesso.')
    setMode('login')
  }

  const inputClass =
    'w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg pl-10 pr-4 py-3 text-sm text-white placeholder:text-[#555] transition-colors focus:outline-none focus:border-brand focus-visible:ring-1 focus-visible:ring-brand'

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black">

      {/* Logo */}
      <div className="mb-8 text-center select-none" aria-label="Universo Mil">
        <p className="text-[9px] font-semibold tracking-[0.45em] text-[#555] uppercase mb-2">
          UNIVERSO
        </p>
        <div className="flex items-center justify-center gap-1" aria-hidden="true">
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

      {/* Card */}
      <div className="w-full max-w-[480px] px-4">
        <div className="bg-[#111] rounded-2xl overflow-hidden shadow-2xl">

          <div className="px-10 pt-8 pb-0">
            <h1 className="text-center text-white/80 font-medium text-[15px]">
              {mode === 'magic' ? 'Entrar sem senha' : 'Faça login na Universo Mil'}
            </h1>
          </div>

          <div className="mt-6 h-[2px] bg-gradient-to-r from-transparent via-brand to-transparent" />

          <div className="px-10 pt-6 pb-8">

            {/* Magic link mode */}
            {mode === 'magic' ? (
              <form onSubmit={handleMagicLink} className="space-y-4">
                <p className="text-xs text-[#777] text-center">
                  Informe seu e-mail e enviaremos um link de acesso.
                </p>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555] pointer-events-none">
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </span>
                  <input
                    type="email"
                    value={magicEmail}
                    onChange={(e) => setMagicEmail(e.target.value)}
                    placeholder="Seu e-mail"
                    required
                    autoComplete="email"
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2 pt-1">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-brand hover:bg-brand-dark disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-colors text-sm"
                  >
                    {loading ? 'Enviando…' : 'Enviar link de acesso'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="w-full border border-brand text-brand hover:bg-brand/5 font-semibold py-3 rounded-lg transition-colors text-sm"
                  >
                    Voltar ao login com senha
                  </button>
                </div>
              </form>
            ) : (
              /* Normal login mode */
              <form onSubmit={handleLogin} noValidate className="space-y-3">

                {/* Email */}
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555] pointer-events-none">
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </span>
                  <input
                    type="email"
                    aria-label="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Seu e-mail"
                    autoComplete="email"
                    className={inputClass}
                    required
                  />
                </div>

                {/* Password */}
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555] pointer-events-none">
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0110 0v4"/>
                    </svg>
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    aria-label="Senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Sua senha"
                    autoComplete="current-password"
                    className={`${inputClass} pr-10`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#888] transition-colors focus:outline-none"
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>

                {/* Forgot password */}
                <div className="flex justify-end pt-0.5">
                  <Link href="/esqueci-senha" className="text-xs text-[#777] hover:text-[#aaa] transition-colors">
                    Esqueceu a senha?
                  </Link>
                </div>

                {/* Buttons */}
                <div className="pt-2 space-y-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-brand hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-colors text-sm"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        Entrando…
                      </span>
                    ) : 'Entrar'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode('magic')}
                    className="w-full border border-brand text-brand hover:bg-brand/5 font-semibold py-3 rounded-lg transition-colors text-sm"
                  >
                    Entrar sem senha
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
