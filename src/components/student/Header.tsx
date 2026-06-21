'use client'

import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'

interface HeaderProps {
  user: { name: string; email: string }
  role: string
  logoUrl?: string | null
}

interface SearchResult {
  id: string
  title: string
  courseName: string
  url: string
}

interface HistoryItem {
  id: string
  title: string
  courseName: string
  url: string
}

export function Header({ user, role, logoUrl }: HeaderProps) {
  const pathname = usePathname()
  const isAdmin = role === 'ADMIN'
  const canPOP = ['COLABORADOR', 'SUPERVISAO', 'GERENTE', 'GESTAO', 'ADMIN'].includes(role)
  const canEquipe = ['SUPERVISAO', 'GESTAO', 'ADMIN'].includes(role)
  const canChecklist = ['COLABORADOR', 'SUPERVISAO', 'GESTAO', 'ADMIN'].includes(role)
  const canAdminPanel = ['SUPERVISAO', 'GESTAO', 'ADMIN'].includes(role)
  const initials = user.name.split(' ').filter(Boolean).map((n) => n[0]).slice(0, 2).join('').toUpperCase() || '?'

  const [activePanel, setActivePanel] = useState<'search' | 'history' | 'profile' | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([])
  const [searching, setSearching] = useState(false)

  const wrapperRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Close on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setActivePanel(null)
      }
    }
    if (activePanel) document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [activePanel])

  // Focus search input on open
  useEffect(() => {
    if (activePanel === 'search') setTimeout(() => searchInputRef.current?.focus(), 50)
  }, [activePanel])

  // Debounced search
  useEffect(() => {
    if (searchQuery.length < 2) { setSearchResults([]); return }
    const t = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
        if (res.ok) setSearchResults(await res.json())
      } finally {
        setSearching(false)
      }
    }, 300)
    return () => clearTimeout(t)
  }, [searchQuery])

  // Load history when panel opens
  useEffect(() => {
    if (activePanel === 'history') {
      fetch('/api/historico').then((r) => r.json()).then(setHistoryItems).catch(() => {})
    }
  }, [activePanel])

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false) }, [pathname])

  function togglePanel(panel: 'search' | 'history' | 'profile') {
    setActivePanel((prev) => (prev === panel ? null : panel))
    if (panel !== 'search') { setSearchQuery(''); setSearchResults([]) }
  }

  const iconBtnClass = (active: boolean) =>
    `flex items-center justify-center w-11 h-11 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1 focus-visible:ring-offset-[#0d0d0d] ${
      active ? 'text-brand bg-brand/10' : 'text-gray-500 hover:text-gray-300'
    }`

  const navLinks = [
    { href: '/homepage', label: 'Início', match: (p: string) => p === '/homepage' },
    { href: '/favoritos', label: 'Favoritos', match: (p: string) => p === '/favoritos' },
    { href: '/pesquisa-clima', label: 'Clima', match: (p: string) => p.startsWith('/pesquisa-clima') },
    { href: '/satisfacao', label: 'NPS Líderes', match: (p: string) => p.startsWith('/satisfacao') },
    ...(canPOP ? [{ href: '/pop', label: 'POP', match: (p: string) => p.startsWith('/pop') }] : []),
    ...(canChecklist ? [{ href: '/checklist', label: 'Checklist', match: (p: string) => p.startsWith('/checklist') }] : []),
    ...(canEquipe ? [{ href: '/equipe', label: 'Minha Equipe', match: (p: string) => p.startsWith('/equipe') }] : []),
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0d0d0d]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-4 sm:px-6 h-14">

        {/* Left: hamburger (mobile) + logo + nav */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={mobileOpen}
            className="sm:hidden flex items-center justify-center w-9 h-9 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            {mobileOpen ? (
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            )}
          </button>

          <Link href="/homepage" aria-label="Página inicial"
            className="flex items-center shrink-0 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-8 w-auto object-contain" />
            ) : (
              <span className="text-[28px] font-black leading-none text-brand tracking-tight">MIL</span>
            )}
          </Link>

          <nav className="hidden sm:flex items-center gap-1" aria-label="Navegação principal">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} aria-current={link.match(pathname) ? 'page' : undefined}
                className={`text-sm px-3 py-2 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                  link.match(pathname) ? 'text-white font-medium' : 'text-gray-400 hover:text-white'
                }`}>
                {link.label}
              </Link>
            ))}
            {canAdminPanel && (
              <Link href="/admin/dashboard"
                className="ml-2 text-xs px-2.5 py-1.5 rounded-lg border border-brand/30 text-brand/80 hover:text-brand hover:border-brand/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand">
                ⚙ Painel Admin
              </Link>
            )}
          </nav>
        </div>

        {/* Right: icons + dropdowns */}
        <div className="flex items-center gap-1 relative" ref={wrapperRef}>

          {/* Search */}
          <button onClick={() => togglePanel('search')} aria-label="Buscar" aria-expanded={activePanel === 'search'}
            className={iconBtnClass(activePanel === 'search')}>
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>

          {/* History */}
          <button onClick={() => togglePanel('history')} aria-label="Histórico de aulas" aria-expanded={activePanel === 'history'}
            className={iconBtnClass(activePanel === 'history')}>
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
            </svg>
          </button>

          {/* Notifications (em breve) */}
          <button disabled aria-label="Notificações — em breve" title="Em breve"
            className={`${iconBtnClass(false)} opacity-35 cursor-default`}>
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
            </svg>
          </button>

          {/* Avatar — opens profile dropdown */}
          <button onClick={() => togglePanel('profile')} aria-label="Menu do usuário" aria-expanded={activePanel === 'profile'}
            className="ml-1 flex items-center justify-center w-9 h-9 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1 focus-visible:ring-offset-[#0d0d0d]">
            <span className="w-8 h-8 rounded-full bg-[#20b2aa] hover:opacity-90 flex items-center justify-center text-white text-xs font-bold select-none transition-opacity" aria-hidden="true">
              {initials}
            </span>
          </button>

          {/* ── Search panel ── */}
          {activePanel === 'search' && (
            <div className="absolute top-12 right-0 w-[380px] bg-[#111] border border-[#2a2a2a] rounded-xl shadow-2xl shadow-black/60 overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-[#2a2a2a]">
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-gray-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input ref={searchInputRef} type="text" value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar aulas…"
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-600 focus:outline-none" />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="text-gray-600 hover:text-gray-400 text-xs px-1">✕</button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto">
                {searching && <p className="px-4 py-8 text-center text-sm text-gray-600">Buscando…</p>}
                {!searching && searchQuery.length >= 2 && searchResults.length === 0 && (
                  <p className="px-4 py-8 text-center text-sm text-gray-600">Nenhum resultado encontrado.</p>
                )}
                {!searching && searchResults.map((r) => (
                  <Link key={r.id} href={r.url} onClick={() => setActivePanel(null)}
                    className="flex flex-col px-4 py-3 hover:bg-[#1a1a1a] transition-colors border-b border-[#1a1a1a] last:border-0">
                    <span className="text-sm text-white line-clamp-1">{r.title}</span>
                    <span className="text-xs text-gray-500 mt-0.5">{r.courseName}</span>
                  </Link>
                ))}
                {searchQuery.length < 2 && (
                  <p className="px-4 py-8 text-center text-sm text-gray-600">Digite pelo menos 2 caracteres…</p>
                )}
              </div>
            </div>
          )}

          {/* ── History panel ── */}
          {activePanel === 'history' && (
            <div className="absolute top-12 right-0 w-[340px] bg-[#111] border border-[#2a2a2a] rounded-xl shadow-2xl shadow-black/60 overflow-hidden">
              <div className="px-4 py-3 border-b border-[#2a2a2a]">
                <p className="text-sm font-semibold text-white">Aulas recentes</p>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {historyItems.length === 0 && (
                  <p className="px-4 py-8 text-center text-sm text-gray-600">Nenhuma aula assistida ainda.</p>
                )}
                {historyItems.map((item) => (
                  <Link key={item.id} href={item.url} onClick={() => setActivePanel(null)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-[#1a1a1a] transition-colors border-b border-[#1a1a1a] last:border-0">
                    <div className="w-7 h-7 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
                      <span className="text-brand text-xs">▶</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{item.title}</p>
                      <p className="text-xs text-gray-500 truncate">{item.courseName}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* ── Profile dropdown ── */}
          {activePanel === 'profile' && (
            <div className="absolute top-12 right-0 w-[230px] bg-[#111] border border-[#2a2a2a] rounded-xl shadow-2xl shadow-black/60 overflow-hidden">
              <div className="px-4 py-4 border-b border-[#2a2a2a]">
                <div className="w-10 h-10 rounded-full bg-[#20b2aa] flex items-center justify-center text-white font-bold text-sm mb-2">
                  {initials}
                </div>
                <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                <span className="inline-block mt-1.5 text-[10px] bg-brand/20 text-brand px-2 py-0.5 rounded-full font-medium capitalize">
                  {role === 'ADMIN' ? 'Administrador' : role === 'SUPERVISAO' ? 'Supervisão' : role === 'GERENTE' ? 'Gerente' : role === 'GESTAO' ? 'Gestão' : 'Colaboradora'}
                </span>
              </div>
              <div className="py-1">
                <Link href="/perfil" onClick={() => setActivePanel(null)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-[#1a1a1a] hover:text-white transition-colors">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                  Editar perfil
                </Link>
                {canAdminPanel && (
                  <Link href="/admin/dashboard" onClick={() => setActivePanel(null)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-brand/80 hover:bg-[#1a1a1a] hover:text-brand transition-colors">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                    </svg>
                    Painel Admin
                  </Link>
                )}
                <div className="h-px bg-[#2a2a2a] my-1" />
                <button onClick={() => signOut({ callbackUrl: '/login' })}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-400/5 hover:text-red-300 transition-colors">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                    <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  Sair
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile nav drawer */}
      {mobileOpen && (
        <div className="sm:hidden bg-[#0d0d0d] border-b border-white/10">
          <nav className="flex flex-col py-2 px-4" aria-label="Navegação mobile">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}
                className={`py-3 text-sm border-b border-white/5 last:border-0 transition-colors ${
                  link.match(pathname) ? 'text-white font-semibold' : 'text-gray-400'
                }`}>
                {link.label}
              </Link>
            ))}
            {canAdminPanel && (
              <Link href="/admin/dashboard"
                className="py-3 text-sm text-brand/80 border-b border-white/5 font-medium">
                ⚙ Painel Admin
              </Link>
            )}
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="py-3 text-sm text-red-400 text-left"
            >
              Sair
            </button>
          </nav>
        </div>
      )}
    </header>
  )
}
