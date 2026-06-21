'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

interface Store {
  id: string
  name: string
  code: string | null
}

interface ChecklistItem {
  id: string
  text: string
  category: string | null
  required: boolean
  order: number
}

interface ChecklistTemplate {
  id: string
  title: string
  description: string | null
  items: ChecklistItem[]
}

type ItemAnswer = { ok: boolean | null; note: string }

export default function ResponderChecklistPage() {
  const params = useParams<{ templateId: string }>()
  const router = useRouter()
  const [template, setTemplate] = useState<ChecklistTemplate | null>(null)
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const [storeId, setStoreId] = useState('')
  const [notes, setNotes] = useState('')
  const [answers, setAnswers] = useState<Record<string, ItemAnswer>>({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      fetch(`/api/checklist/${params.templateId}`).then((r) => r.ok ? r.json() : null),
      fetch('/api/stores').then((r) => r.ok ? r.json() : []),
    ]).then(([templateData, storesData]) => {
      if (templateData) {
        setTemplate(templateData)
        const initial: Record<string, ItemAnswer> = {}
        templateData.items.forEach((i: ChecklistItem) => { initial[i.id] = { ok: null, note: '' } })
        setAnswers(initial)
      }
      setStores(storesData ?? [])
    }).finally(() => setLoading(false))
  }, [params.templateId])

  function setItemAnswer(id: string, ok: boolean) {
    setAnswers((prev) => ({ ...prev, [id]: { ...prev[id], ok } }))
  }

  function setItemNote(id: string, note: string) {
    setAnswers((prev) => ({ ...prev, [id]: { ...prev[id], note } }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!template || !storeId) {
      setError('Selecione a loja')
      return
    }

    const unanswered = template.items.filter((i) => i.required && answers[i.id]?.ok === null)
    if (unanswered.length > 0) {
      setError(`${unanswered.length} item(ns) obrigatório(s) sem resposta`)
      return
    }

    setError('')
    setSubmitting(true)

    const payload = {
      templateId: template.id,
      storeId,
      notes: notes.trim() || null,
      items: template.items
        .filter((i) => answers[i.id]?.ok !== null)
        .map((i) => ({
          itemId: i.id,
          ok: answers[i.id].ok,
          note: answers[i.id].note.trim() || null,
        })),
    }

    const res = await fetch('/api/checklist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    setSubmitting(false)
    if (res.ok) {
      const data = await res.json()
      router.push(`/checklist?enviado=1&score=${data.score ?? ''}`)
    } else {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? 'Erro ao enviar')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-[var(--brand)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!template) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center text-white/50">
        <p>Checklist não encontrado.</p>
      </div>
    )
  }

  const grouped = template.items.reduce<Record<string, ChecklistItem[]>>((acc, item) => {
    const key = item.category ?? 'Geral'
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {})

  const categories = Object.keys(grouped).sort()
  const answeredCount = Object.values(answers).filter((a) => a.ok !== null).length
  const progress = template.items.length > 0 ? Math.round((answeredCount / template.items.length) * 100) : 0

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">{template.title}</h1>
        {template.description && <p className="text-white/60 mt-1 text-sm">{template.description}</p>}
      </div>

      <div className="mb-6 bg-white/5 rounded-xl p-4 border border-white/10">
        <div className="flex justify-between text-sm text-white/60 mb-2">
          <span>Progresso</span>
          <span>{answeredCount}/{template.items.length} itens</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--brand)] rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-white text-sm uppercase tracking-wider">Informações da Loja</h2>
          <div>
            <label className="block text-sm text-white/60 mb-1">Loja *</label>
            {stores.length > 0 ? (
              <select
                value={storeId}
                onChange={(e) => setStoreId(e.target.value)}
                required
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[var(--brand)]"
              >
                <option value="">Selecione a loja…</option>
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            ) : (
              <p className="text-white/40 text-sm italic">Nenhuma loja cadastrada.</p>
            )}
          </div>
        </div>

        {categories.map((cat) => (
          <div key={cat}>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-3">{cat}</h2>
            <div className="space-y-3">
              {grouped[cat].map((item) => {
                const answer = answers[item.id]
                return (
                  <div
                    key={item.id}
                    className={`rounded-xl border p-4 transition-all ${
                      answer?.ok === true ? 'border-green-500/30 bg-green-500/5' :
                      answer?.ok === false ? 'border-red-500/30 bg-red-500/5' :
                      'border-white/10 bg-white/5'
                    }`}
                  >
                    <p className="text-white text-sm mb-3 leading-snug">
                      {item.text}
                      {item.required && <span className="text-[var(--brand)] ml-1">*</span>}
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setItemAnswer(item.id, true)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          answer?.ok === true
                            ? 'bg-green-500 text-white'
                            : 'bg-white/10 text-white/60 hover:bg-green-500/20 hover:text-green-400'
                        }`}
                      >
                        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        Conforme
                      </button>
                      <button
                        type="button"
                        onClick={() => setItemAnswer(item.id, false)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          answer?.ok === false
                            ? 'bg-red-500 text-white'
                            : 'bg-white/10 text-white/60 hover:bg-red-500/20 hover:text-red-400'
                        }`}
                      >
                        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                        Não Conforme
                      </button>
                    </div>
                    {answer?.ok === false && (
                      <textarea
                        value={answer.note}
                        onChange={(e) => setItemNote(item.id, e.target.value)}
                        placeholder="Observação (opcional)"
                        rows={2}
                        className="mt-3 w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-xs placeholder-white/30 focus:outline-none focus:border-[var(--brand)] resize-none"
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        <div>
          <label className="block text-sm text-white/60 mb-1">Observações Gerais</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Observações adicionais sobre a visita..."
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[var(--brand)] resize-none"
          />
        </div>

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-[var(--brand)] hover:bg-[var(--brand)]/90 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {submitting ? 'Enviando...' : 'Enviar Checklist'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 rounded-xl border border-white/20 text-white/70 hover:bg-white/10 transition-colors text-sm font-medium"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
