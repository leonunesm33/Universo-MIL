'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface Config {
  platformName: string
  logoUrl: string
  primaryColor: string
  youtubeUrl: string
  instagramUrl: string
  facebookUrl: string
  websiteUrl: string
}

const inputClass =
  'w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:border-brand bg-white'
const labelClass = 'block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5'

export function IdentidadeTab() {
  const [config, setConfig] = useState<Config>({
    platformName: 'Universo Mil',
    logoUrl: '',
    primaryColor: '#EC55B5',
    youtubeUrl: '',
    instagramUrl: '',
    facebookUrl: '',
    websiteUrl: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)

  useEffect(() => {
    fetch('/api/admin/config')
      .then((r) => r.json())
      .then((data) => {
        setConfig({
          platformName: data.platformName ?? 'Universo Mil',
          logoUrl: data.logoUrl ?? '',
          primaryColor: data.primaryColor ?? '#EC55B5',
          youtubeUrl: data.youtubeUrl ?? '',
          instagramUrl: data.instagramUrl ?? '',
          facebookUrl: data.facebookUrl ?? '',
          websiteUrl: data.websiteUrl ?? '',
        })
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máx. 2MB.')
      return
    }
    setUploadingLogo(true)
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    setUploadingLogo(false)
    if (res.ok) {
      const data = await res.json()
      setConfig((prev) => ({ ...prev, logoUrl: data.url }))
      toast.success('Logo enviado!')
    } else {
      toast.error('Erro ao fazer upload.')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch('/api/admin/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    })
    setSaving(false)
    if (res.ok) {
      toast.success('Configurações salvas com sucesso!')
    } else {
      toast.error('Erro ao salvar configurações.')
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-100 p-8 flex justify-center">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-5">
        <h2 className="text-sm font-semibold text-slate-700 pb-3 border-b border-slate-100">
          Identidade
        </h2>

        <div>
          <label className={labelClass}>Nome da plataforma</label>
          <input
            type="text"
            value={config.platformName}
            onChange={(e) => setConfig({ ...config, platformName: e.target.value })}
            className={inputClass}
            placeholder="Universo Mil"
          />
        </div>

        <div>
          <label className={labelClass}>Logo da plataforma</label>
          <div className="flex items-center gap-3 mb-2">
            {config.logoUrl ? (
              <img
                src={config.logoUrl}
                alt="Logo"
                className="h-12 w-auto rounded border border-slate-200 bg-slate-50 p-1"
              />
            ) : (
              <div className="h-12 w-20 rounded border border-dashed border-slate-300 flex items-center justify-center text-slate-300 text-xs">
                sem logo
              </div>
            )}
            <label
              htmlFor="logo-upload"
              className={`cursor-pointer bg-brand/10 text-brand hover:bg-brand/20 text-sm font-medium px-4 py-2 rounded-lg transition-colors ${uploadingLogo ? 'opacity-50 pointer-events-none' : ''}`}
            >
              {uploadingLogo ? 'Enviando…' : 'Upload'}
            </label>
            <input
              id="logo-upload"
              type="file"
              accept="image/png,image/svg+xml,image/jpeg,image/webp"
              className="hidden"
              onChange={handleLogoUpload}
            />
          </div>
          <input
            type="url"
            value={config.logoUrl}
            onChange={(e) => setConfig({ ...config, logoUrl: e.target.value })}
            className={inputClass}
            placeholder="https://... ou faça upload acima"
          />
          <p className="text-xs text-slate-400 mt-1">PNG, SVG ou JPEG, máx. 2MB</p>
        </div>

        <div>
          <label className={labelClass}>Cor primária</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={config.primaryColor}
              onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
              className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer p-0.5"
            />
            <input
              type="text"
              value={config.primaryColor}
              onChange={(e) => {
                const v = e.target.value
                if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) setConfig({ ...config, primaryColor: v })
              }}
              className="w-36 rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-brand"
              maxLength={7}
            />
            <span className="text-sm text-slate-400">ex: #EC55B5</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-5">
        <h2 className="text-sm font-semibold text-slate-700 pb-3 border-b border-slate-100">
          Redes sociais e site
        </h2>

        <div>
          <label className={labelClass}>YouTube</label>
          <input
            type="url"
            value={config.youtubeUrl}
            onChange={(e) => setConfig({ ...config, youtubeUrl: e.target.value })}
            className={inputClass}
            placeholder="https://youtube.com/@canal"
          />
        </div>

        <div>
          <label className={labelClass}>Instagram</label>
          <input
            type="url"
            value={config.instagramUrl}
            onChange={(e) => setConfig({ ...config, instagramUrl: e.target.value })}
            className={inputClass}
            placeholder="https://instagram.com/perfil"
          />
        </div>

        <div>
          <label className={labelClass}>Facebook</label>
          <input
            type="url"
            value={config.facebookUrl}
            onChange={(e) => setConfig({ ...config, facebookUrl: e.target.value })}
            className={inputClass}
            placeholder="https://facebook.com/pagina"
          />
        </div>

        <div>
          <label className={labelClass}>Site</label>
          <input
            type="url"
            value={config.websiteUrl}
            onChange={(e) => setConfig({ ...config, websiteUrl: e.target.value })}
            className={inputClass}
            placeholder="https://www.suaempresa.com.br"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="bg-brand hover:bg-brand/90 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm"
        >
          {saving ? 'Salvando…' : 'Salvar configurações'}
        </button>
      </div>
    </form>
  )
}
