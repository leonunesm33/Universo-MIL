'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Certificate {
  id: string
  type: 'MODULE' | 'COURSE'
  issuedAt: string
  course: { name: string } | null
  module: { title: string } | null
}

export function CertificatesSection() {
  const [certs, setCerts] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/certificados')
      .then((r) => (r.ok ? r.json() : []))
      .then(setCerts)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return null
  if (certs.length === 0) return null

  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 space-y-3">
      <h2 className="text-sm font-semibold text-white">Meus Certificados</h2>
      <div className="space-y-2">
        {certs.map((c) => {
          const name = c.type === 'MODULE' ? c.module?.title : c.course?.name
          const label = c.type === 'MODULE' ? 'Módulo' : 'Curso'
          const date = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(
            new Date(c.issuedAt)
          )
          return (
            <Link
              key={c.id}
              href={`/certificado/${c.id}`}
              className="flex items-center justify-between gap-3 bg-[#111] border border-[#333] rounded-lg px-4 py-3 hover:border-brand/50 transition-colors group"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{name}</p>
                <p className="text-xs text-gray-500">
                  {label} · {date}
                </p>
              </div>
              <span className="text-xs text-brand shrink-0 group-hover:underline">
                Ver →
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
