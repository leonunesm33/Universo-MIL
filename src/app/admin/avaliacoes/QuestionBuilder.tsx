'use client'

import { useState } from 'react'

interface Option {
  text: string
  isCorrect: boolean
  order: number
}

interface Question {
  text: string
  type: string
  order: number
  options: Option[]
}

function emptyQuestion(order: number): Question {
  return {
    text: '',
    type: 'SINGLE',
    order,
    options: [
      { text: '', isCorrect: true, order: 0 },
      { text: '', isCorrect: false, order: 1 },
    ],
  }
}

export function QuestionBuilder({ initial = [] }: { initial?: Question[] }) {
  const [questions, setQuestions] = useState<Question[]>(
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

  function updateQuestion(qi: number, patch: Partial<Question>) {
    setQuestions((prev) => prev.map((q, i) => (i === qi ? { ...q, ...patch } : q)))
  }

  function addOption(qi: number) {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qi) return q
        return {
          ...q,
          options: [...q.options, { text: '', isCorrect: false, order: q.options.length }],
        }
      })
    )
  }

  function removeOption(qi: number, oi: number) {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qi) return q
        const opts = q.options.filter((_, j) => j !== oi).map((o, j) => ({ ...o, order: j }))
        return { ...q, options: opts }
      })
    )
  }

  function updateOption(qi: number, oi: number, patch: Partial<Option>) {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qi) return q
        let opts = q.options.map((o, j) => (j === oi ? { ...o, ...patch } : o))
        if (patch.isCorrect && q.type === 'SINGLE') {
          opts = opts.map((o, j) => ({ ...o, isCorrect: j === oi }))
        }
        return { ...q, options: opts }
      })
    )
  }

  return (
    <div className="space-y-4">
      <input type="hidden" name="questionsJson" value={JSON.stringify(questions)} />

      {questions.map((q, qi) => (
        <div key={qi} className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-1">
              Questão {qi + 1}
            </span>
            {questions.length > 1 && (
              <button
                type="button"
                onClick={() => removeQuestion(qi)}
                className="text-xs text-red-400 hover:text-red-600"
              >
                Remover
              </button>
            )}
          </div>

          <textarea
            value={q.text}
            onChange={(e) => updateQuestion(qi, { text: e.target.value })}
            placeholder="Enunciado da questão..."
            rows={2}
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand bg-white resize-none"
          />

          <div className="space-y-2">
            <p className="text-xs text-slate-500 font-medium">Alternativas</p>
            {q.options.map((opt, oi) => (
              <div key={oi} className="flex items-center gap-2">
                <input
                  type={q.type === 'SINGLE' ? 'radio' : 'checkbox'}
                  name={`q${qi}_correct`}
                  checked={opt.isCorrect}
                  onChange={(e) => updateOption(qi, oi, { isCorrect: e.target.checked })}
                  className="shrink-0 accent-brand"
                  title="Correta"
                />
                <input
                  type="text"
                  value={opt.text}
                  onChange={(e) => updateOption(qi, oi, { text: e.target.value })}
                  placeholder={`Alternativa ${String.fromCharCode(65 + oi)}`}
                  className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-brand bg-white"
                />
                {q.options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(qi, oi)}
                    className="text-slate-300 hover:text-red-500 text-sm shrink-0"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addOption(qi)}
              className="text-xs text-brand hover:text-brand/80 font-medium"
            >
              + Alternativa
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addQuestion}
        className="w-full border-2 border-dashed border-slate-200 rounded-xl py-3 text-sm text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-colors"
      >
        + Adicionar questão
      </button>
    </div>
  )
}
