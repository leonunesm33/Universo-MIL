'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import Link from 'next/link'

interface Leader {
  id: string
  name: string
}

interface Question {
  id: string
  text: string
  type: string
  options: string[] | null
  order: number
  scaleMin?: number
  scaleMax?: number
}

interface Campaign {
  id: string
  title: string
  description: string | null
  deadlineDate: string | null
  leaders: Leader[]
  questions: Question[]
}

export default function SatisfacaoPage() {
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [alreadyAnswered, setAlreadyAnswered] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const [leaderId, setLeaderId] = useState('')
  const [score, setScore] = useState<number | null>(null)
  const [comment, setComment] = useState('')
  const [answers, setAnswers] = useState<Record<string, string>>({})

  useEffect(() => {
    fetch('/api/satisfacao')
      .then((r) => r.json())
      .then((data) => {
        setCampaign(data.campaign ?? null)
        setAlreadyAnswered(data.alreadyAnswered ?? false)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!campaign) return
    if (score === null) { toast.error('Selecione uma nota de 0 a 10.'); return }
    if (campaign.leaders.length > 0 && !leaderId) { toast.error('Selecione o líder avaliado.'); return }

    setSubmitting(true)
    const res = await fetch('/api/satisfacao', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        campaignId: campaign.id,
        leaderId: leaderId || null,
        score,
        comment: comment.trim() || null,
        answers: Object.entries(answers).map(([questionId, value]) => ({ questionId, value })),
      }),
    })
    setSubmitting(false)

    if (res.ok) {
      setSubmitted(true)
    } else {
      const data = await res.json().catch(() => ({}))
      toast.error(data.error ?? 'Erro ao enviar avaliação.')
    }
  }

  const inputBase = 'w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-white text-sm placeholder-white/30 focus:outline-none focus:border-brand'

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-brand/20 flex items-center justify-center mx-auto mb-6">
          <svg viewBox="0 0 24 24" className="w-8 h-8 text-brand" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Obrigado!</h1>
        <p className="text-white/60 mb-8">Sua avaliação foi registrada com sucesso.</p>
        <Link href="/homepage" className="inline-flex items-center gap-2 bg-brand text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-brand/90 transition-colors">
          Voltar para o início
        </Link>
      </div>
    )
  }

  if (alreadyAnswered) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <p className="text-white/60 mb-6">Você já respondeu esta pesquisa.</p>
        <Link href="/homepage" className="text-brand hover:underline text-sm">Voltar para o início</Link>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <p className="text-white/50">Nenhuma pesquisa de satisfação disponível no momento.</p>
        <Link href="/homepage" className="mt-6 inline-block text-brand hover:underline text-sm">Voltar para o início</Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <Link href="/homepage" className="text-xs text-white/40 hover:text-white/60 transition-colors">
          ← Voltar
        </Link>
        <h1 className="text-2xl font-bold text-white mt-3">{campaign.title}</h1>
        {campaign.description && <p className="text-white/60 mt-1 text-sm">{campaign.description}</p>}
        {campaign.deadlineDate && (
          <p className="text-xs text-amber-400 mt-2">
            Prazo: {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(new Date(campaign.deadlineDate))}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Leader selection */}
        {campaign.leaders.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <label className="block text-sm font-semibold text-white mb-3">
              Líder avaliado <span className="text-brand">*</span>
            </label>
            <select
              value={leaderId}
              onChange={(e) => setLeaderId(e.target.value)}
              className={inputBase}
              required
            >
              <option value="">Selecione um líder…</option>
              {campaign.leaders.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* NPS Score */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <p className="text-sm font-semibold text-white mb-1">
            Numa escala de 0 a 10, qual a sua satisfação com seu líder direto?
            <span className="text-brand ml-1">*</span>
          </p>
          <p className="text-xs text-white/40 mb-4">0 = muito insatisfeito · 10 = muito satisfeito</p>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 11 }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setScore(i)}
                className={`w-11 h-11 rounded-lg text-sm font-bold transition-all ${
                  score === i
                    ? i >= 9 ? 'bg-green-500 text-white' : i >= 7 ? 'bg-amber-400 text-white' : 'bg-red-500 text-white'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                {i}
              </button>
            ))}
          </div>
        </div>

        {/* Extra questions */}
        {campaign.questions.map((q) => (
          <div key={q.id} className="bg-white/5 border border-white/10 rounded-xl p-5">
            <p className="text-sm font-semibold text-white mb-3">{q.text}</p>
            {q.type === 'TEXT' ? (
              <textarea
                value={answers[q.id] ?? ''}
                onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                rows={3}
                placeholder="Sua resposta…"
                className={`${inputBase} resize-none`}
              />
            ) : q.type === 'MULTIPLE' && Array.isArray(q.options) ? (
              <div className="space-y-2">
                {(q.options as string[]).map((opt) => (
                  <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      value={opt}
                      checked={answers[q.id] === opt}
                      onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                      className="accent-brand w-4 h-4"
                    />
                    <span className="text-sm text-white/80 group-hover:text-white transition-colors">{opt}</span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: (q.scaleMax ?? 5) - (q.scaleMin ?? 1) + 1 }, (_, i) => {
                  const val = String((q.scaleMin ?? 1) + i)
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: val }))}
                      className={`w-11 h-11 rounded-lg text-sm font-bold transition-all ${
                        answers[q.id] === val ? 'bg-brand text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'
                      }`}
                    >
                      {val}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        ))}

        {/* Comment */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <label className="block text-sm font-semibold text-white mb-3">Comentário (opcional)</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="Deixe uma observação ou sugestão…"
            className={`${inputBase} resize-none`}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-brand hover:bg-brand/90 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors text-sm"
        >
          {submitting ? 'Enviando…' : 'Enviar avaliação'}
        </button>
      </form>
    </div>
  )
}
