'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CertificatesSection } from './CertificatesSection'

export default function PerfilPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [avatar, setAvatar] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  useEffect(() => {
    fetch('/api/perfil')
      .then((r) => {
        if (!r.ok) throw new Error('Unauthorized')
        return r.json()
      })
      .then((data) => {
        setName(data.name ?? '')
        setEmail(data.email ?? '')
        setAvatar(data.avatar ?? '')
      })
      .catch(() => router.push('/login'))
      .finally(() => setLoadingData(false))
  }, [router])

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 20 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máx. 20MB.')
      return
    }
    setUploadingAvatar(true)
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    if (!res.ok) {
      setUploadingAvatar(false)
      toast.error('Erro ao fazer upload.')
      return
    }
    const data = await res.json()
    const newAvatar = data.url as string
    setAvatar(newAvatar)
    await fetch('/api/perfil', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, avatar: newAvatar }),
    })
    setUploadingAvatar(false)
    toast.success('Foto atualizada!')
    router.refresh()
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword && newPassword !== confirmPassword) {
      toast.error('As senhas não coincidem.')
      return
    }
    if (newPassword && newPassword.length < 6) {
      toast.error('A nova senha deve ter pelo menos 6 caracteres.')
      return
    }
    setLoading(true)
    const body: Record<string, string> = { name }
    if (newPassword) {
      body.currentPassword = currentPassword
      body.newPassword = newPassword
    }
    const res = await fetch('/api/perfil', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) {
      toast.error(data.error ?? 'Erro ao salvar.')
      return
    }
    toast.success('Perfil atualizado com sucesso!')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    router.refresh()
  }

  const inputClass =
    'w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-3 text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-brand transition-colors'

  if (loadingData) {
    return (
      <div className="mx-auto max-w-lg px-6 py-12 flex justify-center">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-10">
      <div className="mb-8">
        <Link href="/homepage" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
          ← Voltar
        </Link>
        <h1 className="text-2xl font-bold text-white mt-3">Meu Perfil</h1>
        <p className="text-sm text-gray-500 mt-1">{email}</p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-5 mb-8">
        {avatar ? (
          <img src={avatar} alt="Foto" className="w-20 h-20 rounded-full object-cover border-2 border-brand" />
        ) : (
          <div className="w-20 h-20 rounded-full bg-brand flex items-center justify-center text-white text-2xl font-bold shrink-0">
            {name.charAt(0).toUpperCase() || '?'}
          </div>
        )}
        <div>
          <label
            htmlFor="avatar-upload"
            className={`cursor-pointer bg-brand/10 text-brand hover:bg-brand/20 text-sm font-medium px-4 py-2 rounded-lg transition-colors ${uploadingAvatar ? 'opacity-50 pointer-events-none' : ''}`}
          >
            {uploadingAvatar ? 'Enviando…' : 'Alterar foto'}
          </label>
          <input
            id="avatar-upload"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleAvatarUpload}
          />
          <p className="text-xs text-gray-500 mt-1">JPG, PNG ou WEBP, máx. 20MB</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Dados básicos */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-white">Dados básicos</h2>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Nome</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">E-mail</label>
            <input
              type="email"
              value={email}
              disabled
              className={`${inputClass} opacity-40 cursor-not-allowed`}
            />
            <p className="text-xs text-gray-600 mt-1">O e-mail não pode ser alterado.</p>
          </div>
        </div>

        {/* Alterar senha */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-white">Alterar senha</h2>
          <p className="text-xs text-gray-500">Deixe em branco para manter a senha atual.</p>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Senha atual</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className={inputClass}
              autoComplete="current-password"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Nova senha</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className={inputClass}
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Confirmar nova senha</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className={inputClass}
              autoComplete="new-password"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand hover:bg-brand-dark disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-colors text-sm"
        >
          {loading ? 'Salvando…' : 'Salvar alterações'}
        </button>
      </form>

      <div className="mt-5">
        <CertificatesSection />
      </div>
    </div>
  )
}
