'use client'

import { useEffect } from 'react'

interface Props {
  title: string
  description?: string
  onConfirm: () => void
  onCancel: () => void
  pending?: boolean
}

export function ConfirmDeleteModal({ title, description, onConfirm, onCancel, pending }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !pending) onCancel()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onCancel, pending])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onClick={(e) => { if (e.target === e.currentTarget && !pending) onCancel() }}
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
        <div className="flex items-start gap-4 mb-5">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14H6L5 6"/>
              <path d="M10 11v6M14 11v6"/>
              <path d="M9 6V4h6v2"/>
            </svg>
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-800">{title}</h2>
            {description && (
              <p className="text-sm text-slate-500 mt-1">{description}</p>
            )}
          </div>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg py-2.5 transition-colors"
          >
            {pending ? 'Excluindo…' : 'Excluir'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="flex-1 border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 text-sm font-medium rounded-lg py-2.5 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
