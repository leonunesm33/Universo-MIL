'use client'

import { useState } from 'react'

interface LeaderEntry { name: string }

export function NPSLeaderInput({ initial }: { initial?: LeaderEntry[] }) {
  const [leaders, setLeaders] = useState<LeaderEntry[]>(initial ?? [])

  function addLeader() {
    setLeaders((prev) => [...prev, { name: '' }])
  }

  function updateLeader(index: number, name: string) {
    setLeaders((prev) => prev.map((l, i) => (i === index ? { name } : l)))
  }

  function removeLeader(index: number) {
    setLeaders((prev) => prev.filter((_, i) => i !== index))
  }

  const valid = leaders.filter((l) => l.name.trim())

  return (
    <div className="space-y-3">
      <input type="hidden" name="leadersJson" value={JSON.stringify(valid)} />

      {leaders.length === 0 && (
        <p className="text-xs text-slate-400">Nenhum líder cadastrado. Os respondentes não verão seleção de líder.</p>
      )}

      {leaders.map((l, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            type="text"
            value={l.name}
            onChange={(e) => updateLeader(i, e.target.value)}
            placeholder="Nome do líder"
            className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand bg-white"
          />
          <button
            type="button"
            onClick={() => removeLeader(i)}
            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addLeader}
        className="inline-flex items-center gap-1.5 text-xs text-brand font-medium hover:text-brand/80 transition-colors"
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Adicionar líder
      </button>
    </div>
  )
}
