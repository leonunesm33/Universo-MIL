'use client'

import { useState, useEffect } from 'react'

interface ClimateQuestion {
  id: string
  text: string
  type: 'SCALE' | 'MULTIPLE' | 'TEXT'
  options: string[] | null
  scaleMin: number
  scaleMax: number
  order: number
  required: boolean
}

interface ClimateResearch {
  id: string
  title: string
  description: string | null
  questions: ClimateQuestion[]
}

type AnswerMap = Record<string, string>

function ScaleQuestion({ question, value, onChange }: {
  question: ClimateQuestion
  value: string
  onChange: (v: string) => void
}) {
  const steps = Array.from({ length: question.scaleMax - question.scaleMin + 1 }, (_, i) => question.scaleMin + i)
  return (
    <div className="flex gap-2 flex-wrap">
      {steps.map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(String(n))}
          className={`w-10 h-10 rounded-lg font-semibold text-sm transition-all ${
            value === String(n)
              ? 'bg-[var(--brand)] text-white scale-110'
              : 'bg-white/10 text-white/70 hover:bg-white/20'
          }`}
        >
          {n}
        </button>
      ))}
      <span className="self-center text-xs text-white/40 ml-1">
        {question.scaleMin} = pior · {question.scaleMax} = melhor
      </span>
    </div>
  )
}

function MultipleQuestion({ question, value, onChange }: {
  question: ClimateQuestion
  value: string
  onChange: (v: string) => void
}) {
  const options: string[] = Array.isArray(question.options) ? question.options : []
  return (
    <div className="flex flex-col gap-2">
      {options.map((opt) => (
        <label key={opt} className="flex items-center gap-3 cursor-pointer group">
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
            value === opt ? 'border-[var(--brand)] bg-[var(--brand)]' : 'border-white/30 group-hover:border-white/60'
          }`}>
            {value === opt && <div className="w-2 h-2 rounded-full bg-white" />}
          </div>
          <span className="text-white/80 text-sm">{opt}</span>
          <input type="radio" className="sr-only" checked={value === opt} onChange={() => onChange(opt)} />
        </label>
      ))}
    </div>
  )
}

export default function PesquisaClimaPage() {
  const [research, setResearch] = useState<ClimateResearch | null>(null)
  const [alreadyAnswered, setAlreadyAnswered] = useState(false)
  const [loading, setLoading] = useState(true)
  const [answers, setAnswers] = useState<AnswerMap>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/pesquisa-clima')
      .then((r) => r.json())
      .then((data) => {
        setResearch(data.research)
        setAlreadyAnswered(data.alreadyAnswered)
      })
      .finally(() => setLoading(false))
  }, [])

  function setAnswer(questionId: string, value: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!research) return

    const missing = research.questions.filter((q) => q.required && !answers[q.id]?.trim())
    if (missing.length > 0) {
      setError(`Por favor responda todas as perguntas obrigatórias (${missing.length} pendente${missing.length > 1 ? 's' : ''})`)
      return
    }

    setError('')
    setSubmitting(true)

    const payload = research.questions.map((q) => ({ questionId: q.id, value: answers[q.id] ?? '' }))

    const res = await fetch('/api/pesquisa-clima', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ researchId: research.id, answers: payload }),
    })

    setSubmitting(false)
    if (res.ok) {
      setSubmitted(true)
    } else {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? 'Erro ao enviar pesquisa')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-[var(--brand)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!research) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <svg viewBox="0 0 24 24" className="w-14 h-14 mx-auto mb-4 text-white/20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
          <rect x="9" y="3" width="6" height="4" rx="1"/>
        </svg>
        <h2 className="text-lg font-semibold text-white mb-2">Nenhuma pesquisa ativa</h2>
        <p className="text-white/50 text-sm">Não há pesquisa de clima disponível no momento.</p>
      </div>
    )
  }

  if (alreadyAnswered || submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
          <svg viewBox="0 0 24 24" className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">
          {submitted ? 'Obrigado pela sua participação!' : 'Você já respondeu esta pesquisa'}
        </h2>
        <p className="text-white/60 text-sm">
          {submitted
            ? 'Sua resposta foi registrada. Suas opiniões são muito importantes para nós.'
            : 'Você já participou desta pesquisa de clima.'}
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">{research.title}</h1>
        {research.description && (
          <p className="text-white/60 mt-2 text-sm leading-relaxed">{research.description}</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {research.questions.map((question, idx) => (
          <div key={question.id} className="bg-white/5 rounded-xl p-5 border border-white/10">
            <p className="font-medium text-white mb-4 leading-snug">
              <span className="text-white/40 mr-2">{idx + 1}.</span>
              {question.text}
              {question.required && <span className="text-[var(--brand)] ml-1">*</span>}
            </p>

            {question.type === 'SCALE' && (
              <ScaleQuestion
                question={question}
                value={answers[question.id] ?? ''}
                onChange={(v) => setAnswer(question.id, v)}
              />
            )}

            {question.type === 'MULTIPLE' && (
              <MultipleQuestion
                question={question}
                value={answers[question.id] ?? ''}
                onChange={(v) => setAnswer(question.id, v)}
              />
            )}

            {question.type === 'TEXT' && (
              <textarea
                rows={3}
                value={answers[question.id] ?? ''}
                onChange={(e) => setAnswer(question.id, e.target.value)}
                placeholder="Escreva sua resposta..."
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[var(--brand)] resize-none"
              />
            )}
          </div>
        ))}

        {error && (
          <p className="text-red-400 text-sm text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[var(--brand)] hover:bg-[var(--brand)]/90 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          {submitting ? 'Enviando...' : 'Enviar Pesquisa'}
        </button>
      </form>
    </div>
  )
}
