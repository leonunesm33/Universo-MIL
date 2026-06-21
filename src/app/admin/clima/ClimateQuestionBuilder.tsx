'use client'

import { useState } from 'react'

type QuestionType = 'SCALE' | 'MULTIPLE' | 'TEXT'

interface ClimateQuestion {
  text: string
  type: QuestionType
  order: number
  required: boolean
  scaleMin: number
  scaleMax: number
  options: string[]
}

function emptyQuestion(order: number): ClimateQuestion {
  return { text: '', type: 'SCALE', order, required: true, scaleMin: 1, scaleMax: 5, options: ['', ''] }
}

export function ClimateQuestionBuilder({ initial = [] }: { initial?: ClimateQuestion[] }) {
  const [questions, setQuestions] = useState<ClimateQuestion[]>(
    initial.length > 0 ? initial : [emptyQuestion(0)]
  )

  function addQuestion() {
    setQuestions((prev) => [...prev, emptyQuestion(prev.length)])
  }

  function removeQuestion(qi: number) {
    setQuestions((prev) =>
      prev.filter((_, i) => i !== qi).map((q, i) => ({ ...q, order: i }))
    )
  }

  function updateQuestion(qi: number, patch: Partial<ClimateQuestion>) {
    setQuestions((prev) => prev.map((q, i) => (i === qi ? { ...q, ...patch } : q)))
  }

  function addOption(qi: number) {
    setQuestions((prev) =>
      prev.map((q, i) => i !== qi ? q : { ...q, options: [...q.options, ''] })
    )
  }

  function removeOption(qi: number, oi: number) {
    setQuestions((prev) =>
      prev.map((q, i) => i !== qi ? q : { ...q, options: q.options.filter((_, j) => j !== oi) })
    )
  }

  function updateOption(qi: number, oi: number, val: string) {
    setQuestions((prev) =>
      prev.map((q, i) => i !== qi ? q : {
        ...q, options: q.options.map((o, j) => j === oi ? val : o)
      })
    )
  }

  return (
    <div className="space-y-4">
      <input type="hidden" name="questionsJson" value={JSON.stringify(questions)} />

      {questions.map((q, qi) => (
        <div key={qi} className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Pergunta {qi + 1}
            </span>
            {questions.length > 1 && (
              <button type="button" onClick={() => removeQuestion(qi)} className="text-xs text-red-400 hover:text-red-600">
                Remover
              </button>
            )}
          </div>

          <textarea
            value={q.text}
            onChange={(e) => updateQuestion(qi, { text: e.target.value })}
            placeholder="Texto da pergunta..."
            rows={2}
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand bg-white resize-none"
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Tipo</label>
              <select
                value={q.type}
                onChange={(e) => updateQuestion(qi, { type: e.target.value as QuestionType })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand bg-white"
              >
                <option value="SCALE">Escala</option>
                <option value="MULTIPLE">Múltipla escolha</option>
                <option value="TEXT">Texto livre</option>
              </select>
            </div>
            <div className="flex items-center gap-2 pt-5">
              <input
                type="checkbox"
                id={`required-${qi}`}
                checked={q.required}
                onChange={(e) => updateQuestion(qi, { required: e.target.checked })}
                className="accent-brand"
              />
              <label htmlFor={`required-${qi}`} className="text-sm text-slate-600 cursor-pointer">
                Obrigatória
              </label>
            </div>
          </div>

          {q.type === 'SCALE' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Mínimo</label>
                <input
                  type="number"
                  value={q.scaleMin}
                  onChange={(e) => updateQuestion(qi, { scaleMin: Number(e.target.value) })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Máximo</label>
                <input
                  type="number"
                  value={q.scaleMax}
                  onChange={(e) => updateQuestion(qi, { scaleMax: Number(e.target.value) })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand"
                />
              </div>
            </div>
          )}

          {q.type === 'MULTIPLE' && (
            <div className="space-y-2">
              <p className="text-xs text-slate-500">Opções</p>
              {q.options.map((opt, oi) => (
                <div key={oi} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => updateOption(qi, oi, e.target.value)}
                    placeholder={`Opção ${oi + 1}`}
                    className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-brand bg-white"
                  />
                  {q.options.length > 2 && (
                    <button type="button" onClick={() => removeOption(qi, oi)} className="text-slate-300 hover:text-red-500 text-sm">✕</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={() => addOption(qi)} className="text-xs text-brand hover:text-brand/80 font-medium">
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
        + Adicionar pergunta
      </button>
    </div>
  )
}
