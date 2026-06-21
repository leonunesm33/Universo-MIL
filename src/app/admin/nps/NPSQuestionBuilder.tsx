'use client'

import { useState } from 'react'

interface NPSQuestion {
  text: string
  type: string
  order: number
  options: string[] | null
}

function emptyQuestion(order: number): NPSQuestion {
  return { text: '', type: 'SCALE', order, options: null }
}

export function NPSQuestionBuilder({ initial = [] }: { initial?: NPSQuestion[] }) {
  const [questions, setQuestions] = useState<NPSQuestion[]>(
    initial.length > 0 ? initial : []
  )

  function addQuestion() {
    setQuestions((prev) => [...prev, emptyQuestion(prev.length)])
  }

  function removeQuestion(i: number) {
    setQuestions((prev) =>
      prev.filter((_, j) => j !== i).map((q, j) => ({ ...q, order: j }))
    )
  }

  function updateQuestion(i: number, patch: Partial<NPSQuestion>) {
    setQuestions((prev) => prev.map((q, j) => j === i ? { ...q, ...patch } : q))
  }

  function addOption(i: number) {
    setQuestions((prev) =>
      prev.map((q, j) => j !== i ? q : { ...q, options: [...(q.options ?? []), ''] })
    )
  }

  function removeOption(i: number, oi: number) {
    setQuestions((prev) =>
      prev.map((q, j) => j !== i ? q : { ...q, options: (q.options ?? []).filter((_, k) => k !== oi) })
    )
  }

  function updateOption(i: number, oi: number, val: string) {
    setQuestions((prev) =>
      prev.map((q, j) => j !== i ? q : {
        ...q, options: (q.options ?? []).map((o, k) => k === oi ? val : o)
      })
    )
  }

  return (
    <div className="space-y-4">
      <input type="hidden" name="questionsJson" value={JSON.stringify(questions)} />

      {questions.length === 0 && (
        <p className="text-sm text-slate-400 text-center py-4">
          Nenhuma pergunta personalizada. A campanha usará apenas a nota NPS padrão (0–10).
        </p>
      )}

      {questions.map((q, i) => (
        <div key={i} className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Pergunta {i + 1}</span>
            <button type="button" onClick={() => removeQuestion(i)} className="text-xs text-red-400 hover:text-red-600">
              Remover
            </button>
          </div>

          <textarea
            value={q.text}
            onChange={(e) => updateQuestion(i, { text: e.target.value })}
            placeholder="Texto da pergunta..."
            rows={2}
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand bg-white resize-none"
          />

          <div>
            <label className="block text-xs text-slate-500 mb-1">Tipo</label>
            <select
              value={q.type}
              onChange={(e) => updateQuestion(i, { type: e.target.value, options: e.target.value === 'MULTIPLE' ? ['', ''] : null })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand bg-white"
            >
              <option value="SCALE">Escala (0–10)</option>
              <option value="TEXT">Texto livre</option>
              <option value="MULTIPLE">Múltipla escolha</option>
            </select>
          </div>

          {q.type === 'MULTIPLE' && (
            <div className="space-y-2">
              <p className="text-xs text-slate-500">Opções</p>
              {(q.options ?? []).map((opt, oi) => (
                <div key={oi} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => updateOption(i, oi, e.target.value)}
                    placeholder={`Opção ${oi + 1}`}
                    className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-brand bg-white"
                  />
                  {(q.options ?? []).length > 2 && (
                    <button type="button" onClick={() => removeOption(i, oi)} className="text-slate-300 hover:text-red-500 text-sm">✕</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={() => addOption(i)} className="text-xs text-brand hover:text-brand/80 font-medium">
                + Opção
              </button>
            </div>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={addQuestion}
        className="w-full border-2 border-dashed border-slate-200 rounded-xl py-3 text-sm text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-colors"
      >
        + Adicionar pergunta personalizada
      </button>
    </div>
  )
}
