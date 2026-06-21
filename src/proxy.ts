import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import { can } from '@/lib/permissions'
import type { AppRole } from '@/types/next-auth'

const PUBLIC_PREFIXES = ['/login', '/convite', '/esqueci-senha', '/redefinir-senha', '/magic-signin', '/api/auth']

export default auth(function proxy(req) {
  const { pathname } = req.nextUrl
  const session = req.auth
  const role = session?.user?.role as AppRole | undefined

  // Public routes — allow always, redirect logged-in users away from /login
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) {
    if (pathname === '/login' && role) {
      const dest = role === 'ADMIN' ? '/admin/dashboard' : '/homepage'
      return NextResponse.redirect(new URL(dest, req.url))
    }
    return NextResponse.next()
  }

  // Root redirect
  if (pathname === '/') {
    if (!role) return NextResponse.redirect(new URL('/login', req.url))
    const dest = can(role, 'admin_panel') || can(role, 'admin_analytics')
      ? '/admin/dashboard'
      : '/homepage'
    return NextResponse.redirect(new URL(dest, req.url))
  }

  // Not authenticated → login
  if (!role) return NextResponse.redirect(new URL('/login', req.url))

  // Admin routes — fine-grained access control
  if (pathname.startsWith('/admin')) {
    // Analytics-only routes: SUPERVISAO, GESTAO, ADMIN
    const analyticsPaths = ['/admin/dashboard', '/admin/relatorios', '/admin/ranking']
    if (analyticsPaths.some((p) => pathname.startsWith(p))) {
      if (!can(role, 'admin_analytics')) {
        return NextResponse.redirect(new URL('/homepage', req.url))
      }
      // Analytics users without admin_panel cannot access admin-only sub-routes
      return NextResponse.next()
    }
    // All other /admin/* routes require admin_panel
    if (!can(role, 'admin_panel')) {
      return NextResponse.redirect(new URL('/admin/dashboard', req.url))
    }
  }

  // POP — SUPERVISAO, GERENTE, ADMIN
  if (pathname.startsWith('/pop') && !can(role, 'pop')) {
    return NextResponse.redirect(new URL('/homepage', req.url))
  }

  // Checklist — SUPERVISAO, GESTAO, ADMIN for answering
  if (pathname.startsWith('/checklist') && !can(role, 'checklist_answer')) {
    return NextResponse.redirect(new URL('/homepage', req.url))
  }

  // Team evolution — GESTAO, ADMIN
  if (pathname.startsWith('/equipe') && !can(role, 'team_evolution')) {
    return NextResponse.redirect(new URL('/homepage', req.url))
  }

  // Pesquisa de clima — all authenticated users
  // /pesquisa-clima is already covered by the catch-all below

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
