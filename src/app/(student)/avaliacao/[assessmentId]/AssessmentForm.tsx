'use client'

import { useState, useTransition } from 'react'
import { submitAssessment } from './actions'

interface Option {
  id: string
  text: string
}

interface Question {
  id: string
  text: string
  type: string
  options: Option[]
}

interface Props {
  assessmentId: string
  questions: Question[]
  passingScore: number | null
  courseSlug: string | null
}

export function AssessmentForm({ assessmentId, questions, passingScore, courseSlug }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null)
  const [isPending, startTransition] = useTransition()

  const allAnswered = questions.every((q) => answers[q.id])

  function handleSelect(questionId: string, optionId: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }))
  }

  function handleSubmit() {
    if (!allAnswered) return
    startTransition(async () => {
      const res = await submitAssessment(assessmentId, answers)
      setResult(res)
    })
  }

  if (result) {
    return (
      <div className={`rounded-2xl border p-8 text-center ${
        result.passed ? 'border-green-500/20 bg-green-500/5' : 'border-red-500/20 bg-red-500/5'
      }`}>
        <div className="text-5xl mb-4">{result.passed ? '🎉' : '😔'}</div>
        <h2 className={`text-2xl font-bold mb-2 ${result.passed ? 'text-green-400' : 'text-red-400'}`}>
          {result.passed ? 'Aprovado!' : 'Reprovado'}
        </h2>
        <p className="text-white/60 text-lg mb-1">
          Sua nota: <strong className="text-white">{result.score}%</strong>
        </p>
        {passingScore != null && (
          <p className="text-white/40 text-sm">Nota mínima: {passingScore}%</p>
        )}
        {courseSlug && (
          <a
            href={`/curso/${courseSlug}`}
            className="inline-block mt-6 bg-white/10 hover:bg-white/15 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors"
          >
            Voltar ao curso
          </a>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {questions.map((q, qi) => (
        <div key={q.id} className="bg-white/5 border border-white/10 rounded-xl p-5">
          <p className="text-white font-medium mb-4">
            <span className="text-white/40 text-sm mr-2">{qi + 1}.</span>
            {q.text}
          </p>
          <div className="space-y-2">
            {q.options.map((opt) => {
              const selected = answers[q.id] === opt.id
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelect(q.id, opt.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors ${
                    selected
                      ? 'border-brand bg-brand/10 text-white'
                      : 'border-white/10 text-white/70 hover:border-white/20 hover:bg-white/5'
                  }`}
                >
                  {opt.text}
                </button>
              )
            })}
          </div>
        </div>
      ))}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!allAnswered || isPending}
          className="bg-[var(--brand)] text-white font-semibold px-8 py-3 rounded-xl text-sm disabled:opacity-40 hover:bg-[var(--brand)]/90 transition-colors"
        >
          {isPending ? 'Enviando…' : 'Enviar respostas'}
        </button>
      </div>
    </div>
  )
}
