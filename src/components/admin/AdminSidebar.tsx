'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import type { AppRole } from '@/types/next-auth'

type NavItem = {
  href: string
  label: string
  icon: React.ReactNode
  roles: AppRole[]
}

type NavSection = {
  title: string
  roles: AppRole[]
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    title: 'Análise',
    roles: ['SUPERVISAO', 'GESTAO', 'ADMIN'],
    items: [
      {
        href: '/admin/dashboard',
        label: 'Dashboard',
        roles: ['SUPERVISAO', 'GESTAO', 'ADMIN'],
        icon: (
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/>
            <rect x="14" y="14" width="7" height="7" rx="1"/>
          </svg>
        ),
      },
      {
        href: '/admin/relatorios',
        label: 'Relatórios',
        roles: ['SUPERVISAO', 'GESTAO', 'ADMIN'],
        icon: (
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10"/>
            <line x1="12" y1="20" x2="12" y2="4"/>
            <line x1="6" y1="20" x2="6" y2="14"/>
            <line x1="2" y1="20" x2="22" y2="20"/>
          </svg>
        ),
      },
      {
        href: '/admin/ranking',
        label: 'Ranking',
        roles: ['SUPERVISAO', 'GESTAO', 'ADMIN'],
        icon: (
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        ),
      },
    ],
  },
  {
    title: 'Gestão',
    roles: ['ADMIN'],
    items: [
      {
        href: '/admin/plataforma',
        label: 'Plataforma',
        roles: ['ADMIN'],
        icon: (
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/>
            <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
          </svg>
        ),
      },
      {
        href: '/admin/alunos',
        label: 'Alunos',
        roles: ['ADMIN'],
        icon: (
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
          </svg>
        ),
      },
      {
        href: '/admin/avaliacoes',
        label: 'Avaliações',
        roles: ['ADMIN'],
        icon: (
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
            <rect x="9" y="3" width="6" height="4" rx="1"/>
            <path d="M9 12l2 2 4-4"/>
          </svg>
        ),
      },
      {
        href: '/admin/pop',
        label: 'POP',
        roles: ['ADMIN'],
        icon: (
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
        ),
      },
      {
        href: '/admin/clima',
        label: 'Clima',
        roles: ['ADMIN'],
        icon: (
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"/>
          </svg>
        ),
      },
      {
        href: '/admin/checklist',
        label: 'Checklist',
        roles: ['ADMIN'],
        icon: (
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 11 12 14 22 4"/>
            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
          </svg>
        ),
      },
      {
        href: '/admin/nps',
        label: 'Satisfação',
        roles: ['ADMIN'],
        icon: (
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
        ),
      },
      {
        href: '/admin/configuracoes',
        label: 'Configurações',
        roles: ['ADMIN'],
        icon: (
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
          </svg>
        ),
      },
    ],
  },
]

interface AdminSidebarProps {
  adminName: string
  userRole: AppRole
}

export function AdminSidebar({ adminName, userRole }: AdminSidebarProps) {
  const pathname = usePathname()
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('sidebar-expanded')
    if (stored === 'true') {
      setExpanded(true)
      document.documentElement.dataset.sidebarExpanded = 'true'
    }
  }, [])

  function toggleExpanded() {
    const next = !expanded
    setExpanded(next)
    localStorage.setItem('sidebar-expanded', String(next))
    document.documentElement.dataset.sidebarExpanded = String(next)
  }

  const visibleSections = navSections
    .filter((section) => (section.roles as string[]).includes(userRole))
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => (item.roles as string[]).includes(userRole)),
    }))
    .filter((section) => section.items.length > 0)

  return (
    <aside
      className={`fixed left-0 top-0 bottom-0 bg-white border-r border-slate-200 z-40 flex flex-col py-3 transition-all duration-200 overflow-hidden ${
        expanded ? 'w-56' : 'w-14'
      }`}
    >
      {/* Top: Logo + Toggle */}
      <div className="flex items-center px-2 mb-3 shrink-0 min-w-0">
        <Link
          href="/admin/dashboard"
          title="Admin"
          className="w-9 h-9 bg-brand rounded-lg flex items-center justify-center shrink-0 hover:bg-brand-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </Link>
        {expanded && (
          <span className="ml-2.5 text-sm font-semibold text-slate-700 truncate flex-1">Admin</span>
        )}
        <button
          onClick={toggleExpanded}
          title={expanded ? 'Recolher' : 'Expandir'}
          className={`${expanded ? 'ml-auto' : 'ml-1'} w-7 h-7 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand shrink-0`}
        >
          {expanded ? (
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          )}
        </button>
      </div>

      {/* Nav sections */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 space-y-0.5">
        {visibleSections.map((section, si) => (
          <div key={section.title}>
            {si > 0 && <hr className="border-slate-100 mx-1 my-1" />}
            {expanded && (
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 px-2 pt-3 pb-1 select-none whitespace-nowrap">
                {section.title}
              </p>
            )}
            {section.items.map((item) => {
              const isActive = pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-label={item.label}
                  title={!expanded ? item.label : undefined}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                    expanded ? 'gap-2.5 px-2.5 py-2' : 'w-10 h-10 justify-center mx-auto'
                  } ${
                    isActive
                      ? 'bg-brand/10 text-brand'
                      : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                  }`}
                >
                  <span className="shrink-0">{item.icon}</span>
                  {expanded && <span className="text-sm truncate">{item.label}</span>}
                </Link>
              )
            })}
          </div>
        ))}
      </div>

      {/* Admin avatar */}
      <div
        className={`shrink-0 px-2 flex items-center gap-2.5 mt-2 ${expanded ? '' : 'justify-center'}`}
        title={adminName}
      >
        <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center text-white text-xs font-bold shrink-0 cursor-default">
          {adminName.charAt(0).toUpperCase()}
        </div>
        {expanded && <span className="text-xs text-slate-500 truncate">{adminName}</span>}
      </div>
    </aside>
  )
}
