'use client'

import { Suspense, useEffect, useRef } from 'react'
import { signIn } from 'next-auth/react'
import { useSearchParams, useRouter } from 'next/navigation'

function MagicSigninContent() {
  const params = useSearchParams()
  const router = useRouter()
  const done = useRef(false)

  useEffect(() => {
    if (done.current) return
    done.current = true
    const token = params.get('token')
    if (!token) {
      router.replace('/login')
      return
    }
    signIn('magic-link', { token, redirect: false }).then((res) => {
      if (res?.error) {
        router.replace('/login?error=link-invalido')
      } else {
        router.replace('/homepage')
      }
    })
  }, [params, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/60 text-sm">Verificando seu acesso…</p>
      </div>
    </div>
  )
}

export default function MagicSigninPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-10 h-10 border-2 border-[#EC55B5] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <MagicSigninContent />
    </Suspense>
  )
}
