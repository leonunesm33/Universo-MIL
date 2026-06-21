'use client'

import { useState } from 'react'

interface ChecklistItem {
  text: string
  category: string
  order: number
  required: boolean
}

function emptyItem(order: number): ChecklistItem {
  return { text: '', category: '', order, required: true }
}

export function ChecklistItemBuilder({ initial = [] }: { initial?: ChecklistItem[] }) {
  const [items, setItems] = useState<ChecklistItem[]>(
    initial.length > 0 ? initial : [emptyItem(0)]
  )

  function addItem() {
    setItems((prev) => [...prev, emptyItem(prev.length)])
  }

  function removeItem(i: number) {
    setItems((prev) => prev.filter((_, j) => j !== i).map((it, j) => ({ ...it, order: j })))
  }

  function updateItem(i: number, patch: Partial<ChecklistItem>) {
    setItems((prev) => prev.map((it, j) => j === i ? { ...it, ...patch } : it))
  }

  return (
    <div className="space-y-3">
      <input type="hidden" name="itemsJson" value={JSON.stringify(items)} />

      {items.map((item, i) => (
        <div key={i} className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Item {i + 1}</span>
            {items.length > 1 && (
              <button type="button" onClick={() => removeItem(i)} className="text-xs text-red-400 hover:text-red-600">
                Remover
              </button>
            )}
          </div>

          <input
            type="text"
            value={item.text}
            onChange={(e) => updateItem(i, { text: e.target.value })}
            placeholder="Descrição do item..."
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand bg-white"
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Categoria</label>
              <input
                type="text"
                value={item.category}
                onChange={(e) => updateItem(i, { category: e.target.value })}
                placeholder="Ex: Higiene, Estoque..."
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand bg-white"
              />
            </div>
            <div className="flex items-center gap-2 pt-5">
              <input
                type="checkbox"
                id={`required-${i}`}
                checked={item.required}
                onChange={(e) => updateItem(i, { required: e.target.checked })}
                className="accent-brand"
              />
              <label htmlFor={`required-${i}`} className="text-sm text-slate-600 cursor-pointer">
                Obrigatório
              </label>
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addItem}
        className="w-full border-2 border-dashed border-slate-200 rounded-xl py-3 text-sm text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-colors"
      >
        + Adicionar item
      </button>
    </div>
  )
}
