'use client'

import { useState, useRef } from 'react'
import { toast } from 'sonner'

interface FileUploadInputProps {
  name: string
  defaultValue?: string
}

export function FileUploadInput({ name, defaultValue = '' }: FileUploadInputProps) {
  const [url, setUrl] = useState(defaultValue)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const form = new FormData()
    form.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: form })
    e.target.value = ''
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      toast.error(data.error ?? 'Erro ao enviar arquivo')
      setUploading(false)
      return
    }
    const data = await res.json()
    setUrl(data.url)
    setUploading(false)
    toast.success('Arquivo enviado!')
  }

  return (
    <div className="flex gap-2">
      <input
        name={name}
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://... ou use o botão de upload"
        className="flex-1 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand bg-white"
      />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-medium rounded-lg border border-slate-200 transition-colors whitespace-nowrap disabled:opacity-50"
      >
        <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 10v3a1 1 0 001 1h10a1 1 0 001-1v-3M8 2v8M5 5l3-3 3 3"/>
        </svg>
        {uploading ? 'Enviando…' : 'Upload'}
      </button>
      <input ref={fileRef} type="file" className="hidden" onChange={handleUpload} />
    </div>
  )
}
