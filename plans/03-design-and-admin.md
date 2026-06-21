# Plano Fase 3 — Redesign UX/UI + Admin Dashboard

## Contexto
Next.js 16.2.9 + TypeScript + Tailwind v4 + shadcn v4 + Prisma v5 + NextAuth v5.

**Diretório**: `d:\Projetos\Learn_plataform` | **Alias**: `@/*` → `./src/*`

**CRÍTICO Next.js 16**: `params` é Promise — sempre `await params` em pages, layouts e route handlers.

---

## APIs Confirmadas (Phase 0)

### Design system — dois temas distintos (confirmado via screenshots)

| Área | Fundo | Acento | Estilo |
|---|---|---|---|
| Student portal | `#141414` dark | `#e0167a` hot pink | Netflix/dark |
| Admin dashboard | `#f4f5f7` light | `#3b82f6` blue | SaaS/light |

### Tailwind v4 — adição de tokens custom (fonte: globals.css atual)
```css
/* 1. Definir var em :root (NÃO em @layer base) */
:root {
  --brand: #e0167a;
  --brand-dark: #c4136a;
}

/* 2. Registrar no bloco @theme inline existente */
@theme inline {
  --color-brand: var(--brand);
  --color-brand-dark: var(--brand-dark);
}
```
Uso: `bg-brand`, `text-brand`, `border-brand`, `hover:bg-brand-dark`

**NÃO usar**: `bg-[--color-brand]` (desnecessário quando registrado em @theme inline)

### Next.js 16 — Server Actions
```ts
'use server'  // file-level — obrigatório para importar de Client Components

import { revalidatePath } from 'next/cache'

// Revalidar path literal
revalidatePath('/admin/plataforma')
// Revalidar path dinâmico — segundo arg obrigatório quando há [slug]
revalidatePath('/admin/plataforma/[courseId]', 'page')
```

**NÃO usar**: `revalidateTag(tag)` sem segundo argumento (deprecated em v16)

### shadcn v4 — ATENÇÃO
Todo componente instalado usa `@base-ui/react` em vez de Radix. **Após instalar qualquer componente, LER o arquivo gerado em `src/components/ui/` antes de usar.** As props podem diferir radicalmente de versões anteriores.

### recharts — LineChart / BarChart
```tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

// Padrão básico:
<ResponsiveContainer width="100%" height={200}>
  <LineChart data={data}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="date" />
    <YAxis />
    <Tooltip />
    <Line type="monotone" dataKey="count" stroke="#3b82f6" />
  </LineChart>
</ResponsiveContainer>
```

### Admin — Estrutura visual confirmada via screenshots
- **Sidebar**: 56–64px wide, icon-only, white bg, light border
- **Top navbar**: ~44px, near-black `#0f172a`
- **Conteúdo**: `bg-slate-50` / `bg-gray-50`, max-width não fixo (full)
- **Cards**: white, `shadow-sm`, `rounded-lg`, border `#e2e8f0`
- **Pill tabs**: `rounded-full`, active = black filled, inactive = border-only
- **Tabelas**: sem bordas externas, só row dividers

---

## Fase 1 — Dependências e Design Tokens

**Objetivo**: recharts instalado, todos os shadcn components necessários presentes, globals.css com tokens de marca.

### 1.1 Instalar recharts
```bash
$env:NODE_TLS_REJECT_UNAUTHORIZED = "0"; npm install recharts
```

### 1.2 Instalar shadcn components
Instalar um por vez com `--yes`. Após instalar CADA UM, ler o arquivo gerado:
```bash
npx shadcn@latest add skeleton --yes
npx shadcn@latest add dialog --yes
npx shadcn@latest add sheet --yes
npx shadcn@latest add dropdown-menu --yes
npx shadcn@latest add tabs --yes
npx shadcn@latest add select --yes
npx shadcn@latest add table --yes
npx shadcn@latest add switch --yes
npx shadcn@latest add sonner --yes
```

### 1.3 Atualizar `src/app/globals.css`
Adicionar tokens brand no bloco `:root` existente e registrar em `@theme inline`.

Encontrar o bloco `:root {` no globals.css atual e adicionar DENTRO dele:
```css
  /* Brand colors */
  --brand: #e0167a;
  --brand-dark: #c4136a;
  --brand-muted: rgba(224, 22, 122, 0.15);
```

Encontrar o bloco `@theme inline {` e adicionar DENTRO dele:
```css
  --color-brand: var(--brand);
  --color-brand-dark: var(--brand-dark);
  --color-brand-muted: var(--brand-muted);
```

### 1.4 Adicionar Toaster ao root layout
Em `src/app/layout.tsx`, importar e adicionar o Toaster do sonner:
```tsx
import { Toaster } from '@/components/ui/sonner'
// No body: <Toaster richColors position="top-right" />
```
**ATENÇÃO**: Ler `src/components/ui/sonner.tsx` após instalar para confirmar o nome do export.

### Verificação Fase 1
- `node_modules/recharts` existe
- `src/components/ui/skeleton.tsx`, `dialog.tsx`, `tabs.tsx`, `table.tsx` existem
- `npx tsc --noEmit` passa sem erros
- `src/app/globals.css` contém `--brand: #e0167a`

---

## Fase 2 — Redesign do Portal do Colaborador

**Objetivo**: Todas as 5 páginas student com visual Netflix-dark + hot pink.

**Nota**: As páginas usam a `(student)` route group e já têm auth. O redesign é purely visual.

### 2.1 Login Page — redesign completo

Reescrever `src/app/login/page.tsx`:
- Fundo `bg-[#141414]` full-screen com gradiente radial sutil
- Card centralizado `bg-[#1a1a1a]` com `shadow-2xl rounded-2xl`
- Logo/título acima do form com acento brand (`text-brand`)
- **Tabs** para alternar Email/Senha × CPF (usar componente `Tabs` instalado — LER `src/components/ui/tabs.tsx` para API exata)
- Botão de submit com `bg-brand hover:bg-brand-dark`

```tsx
'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
// Ler tabs.tsx gerado e importar os sub-componentes corretos

export default function LoginPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'email' | 'cpf'>('email')
  const [email, setEmail] = useState('')
  const [cpf, setCpf] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const providerId = tab === 'email' ? 'credentials' : 'cpf'
    const credentials = tab === 'email' ? { email, password } : { cpf, password }
    const result = await signIn(providerId, { ...credentials, redirect: false })
    setLoading(false)
    if (result?.error) setError('Credenciais incorretas.')
    else router.push('/homepage')
  }

  return (
    <div className="min-h-screen bg-[#141414] flex items-center justify-center"
         style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(224,22,122,0.08) 0%, #141414 60%)' }}>
      <div className="w-full max-w-md px-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-white fill-current">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span className="text-xl font-bold text-white">MIL Bijus</span>
          </div>
          <p className="text-sm text-gray-400">Plataforma de Treinamentos</p>
        </div>

        <div className="bg-[#1a1a1a] rounded-2xl p-8 shadow-2xl border border-[#2a2a2a]">
          <h1 className="text-xl font-semibold text-white mb-6">Entrar na plataforma</h1>

          {/* Tabs — usar API do componente gerado */}
          {/* [IMPLEMENTADOR: ler src/components/ui/tabs.tsx e usar a API correta] */}

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {tab === 'email' ? (
              <div className="space-y-2">
                <Label className="text-gray-300 text-sm">Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="bg-[#252525] border-[#333] text-white placeholder:text-gray-600 focus:border-brand"
                  required
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label className="text-gray-300 text-sm">CPF</Label>
                <Input
                  type="text"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  placeholder="000.000.000-00"
                  className="bg-[#252525] border-[#333] text-white placeholder:text-gray-600 focus:border-brand"
                  required
                />
              </div>
            )}
            <div className="space-y-2">
              <Label className="text-gray-300 text-sm">Senha</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-[#252525] border-[#333] text-white placeholder:text-gray-600 focus:border-brand"
                required
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-brand hover:bg-brand-dark text-white font-medium h-11 rounded-lg transition-colors"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
```

**Anti-pattern**: Não usar `style={{ background: ... }}` em elementos filhos — apenas no wrapper externo para o gradiente.

### 2.2 Header — hot pink + glassmorphism

Reescrever `src/components/student/Header.tsx`:
```tsx
'use client'

import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'

interface HeaderProps {
  user: { name: string; email: string }
}

export function Header({ user }: HeaderProps) {
  const pathname = usePathname()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5
                       bg-[#141414]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 h-14">
        {/* Logo */}
        <Link href="/homepage" className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 bg-brand rounded-md flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-white fill-current">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span className="font-bold text-white text-sm tracking-wide">MIL Bijus</span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-6">
          <Link
            href="/homepage"
            className={`text-sm transition-colors ${
              pathname === '/homepage' ? 'text-white font-medium' : 'text-gray-400 hover:text-white'
            }`}
          >
            Início
          </Link>
          <Link
            href="/favoritos"
            className={`text-sm transition-colors ${
              pathname === '/favoritos' ? 'text-white font-medium' : 'text-gray-400 hover:text-white'
            }`}
          >
            Favoritos
          </Link>
        </nav>

        {/* User */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400 hidden sm:block">{user.name}</span>
          <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center
                         text-white text-xs font-bold shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  )
}
```

### 2.3 Homepage — Netflix-style

Reescrever `src/app/(student)/homepage/page.tsx`:
- Hero section se houver curso em andamento (último LessonProgress updated)
- Grid de cursos com cards dark + hover overlay com gradiente
- Progresso como barra na base do card

```tsx
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Progress } from '@/components/ui/progress'

export default async function Homepage() {
  const session = await auth()
  if (!session) redirect('/login')

  const enrollments = await prisma.userCourse.findMany({
    where: { userId: session.user.id },
    include: {
      course: {
        include: {
          modules: {
            include: {
              lessons: {
                include: { progress: { where: { userId: session.user.id } } },
              },
            },
          },
        },
      },
    },
    orderBy: { enrolledAt: 'desc' },
  })

  // Último progresso para hero
  const lastProgress = await prisma.lessonProgress.findFirst({
    where: { userId: session.user.id },
    orderBy: { updatedAt: 'desc' },
    include: { lesson: { include: { module: { include: { course: true } } } } },
  })
  const heroCourse = lastProgress?.lesson.module.course ?? enrollments[0]?.course

  return (
    <div className="bg-[#141414] min-h-screen">
      {/* Hero */}
      {heroCourse && (
        <div className="relative pt-14 overflow-hidden">
          <div className="h-64 bg-gradient-to-b from-[#1a1a1a] to-[#141414] flex items-end">
            <div className="mx-auto max-w-[1280px] w-full px-6 pb-8">
              <p className="text-xs text-brand font-medium uppercase tracking-widest mb-2">
                {lastProgress ? 'Continue assistindo' : 'Comece por aqui'}
              </p>
              <h1 className="text-3xl font-bold text-white mb-3">{heroCourse.name}</h1>
              {heroCourse.description && (
                <p className="text-gray-400 text-sm max-w-lg line-clamp-2">{heroCourse.description}</p>
              )}
              <Link
                href={`/curso/${heroCourse.slug}`}
                className="mt-4 inline-flex items-center gap-2 bg-brand hover:bg-brand-dark
                           text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
              >
                ▶ {lastProgress ? 'Continuar' : 'Começar'}
              </Link>
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#141414]/60 via-transparent to-[#141414]/60 pointer-events-none" />
        </div>
      )}

      {/* Course grid */}
      <div className="mx-auto max-w-[1280px] px-6 py-10">
        {!heroCourse && <div className="h-14" />}
        <h2 className="text-lg font-semibold text-white mb-5">Meus Cursos</h2>

        {enrollments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <p className="text-gray-500">Nenhum curso disponível ainda.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {enrollments.map(({ course }) => {
              const allLessons = course.modules.flatMap((m) => m.lessons)
              const completedCount = allLessons.filter((l) => l.progress.some((p) => p.completed)).length
              const total = allLessons.length
              const percent = total > 0 ? Math.round((completedCount / total) * 100) : 0

              return (
                <Link key={course.id} href={`/curso/${course.slug}`} className="group block">
                  <div className="relative overflow-hidden rounded-lg bg-[#1f1f1f] border border-[#2a2a2a]
                                  transition-transform duration-200 group-hover:scale-[1.02] group-hover:border-[#3a3a3a]">
                    {/* Thumbnail */}
                    {course.banner ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={course.banner} alt={course.name} className="w-full h-36 object-cover" />
                    ) : (
                      <div className="w-full h-36 bg-gradient-to-br from-[#2a1a25] to-[#1a1a2a]
                                      flex items-center justify-center">
                        <span className="text-4xl opacity-50">🎓</span>
                      </div>
                    )}
                    {/* Progress badge */}
                    <div className="absolute top-2 right-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                        ${percent === 100
                          ? 'bg-green-500/20 text-green-400'
                          : percent > 0
                          ? 'bg-brand/20 text-brand'
                          : 'bg-white/10 text-gray-300'}`}>
                        {percent === 100 ? '✓ Concluído' : percent > 0 ? `${percent}%` : 'Novo'}
                      </span>
                    </div>
                    {/* Info */}
                    <div className="p-3">
                      <h3 className="text-sm font-medium text-white leading-snug mb-2 line-clamp-2">
                        {course.name}
                      </h3>
                      <Progress
                        value={percent}
                        className="h-1 bg-[#333]"
                      />
                      <p className="mt-1.5 text-xs text-gray-500">{completedCount}/{total} aulas</p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
```

### 2.4 Course page redesign

Reescrever `src/app/(student)/curso/[courseSlug]/page.tsx` com visual dark refinado:
- Header do curso com banner/gradiente
- Lista de módulos com estilo colapsável manual (sem Accordion — simples e confiável)
- Cada aula com hover state de borda esquerda brand

### 2.5 Lesson page redesign

Reescrever `src/app/(student)/curso/[courseSlug]/[lessonSlug]/[lessonId]/page.tsx`:
- Player sem rounded corners, full-width da coluna
- Info da aula com espaçamento elegante
- Sidebar: scrollable fixo, fundo `#0f0f0f`, aula ativa com borda esquerda brand (`border-l-2 border-brand`)

### 2.6 Favoritos redesign

Reescrever `src/app/(student)/favoritos/page.tsx`:
- Grid cards estilo homepage
- Empty state com ícone e call-to-action

### Verificação Fase 2
- Login: tabs Email/CPF funcionando, fundo dark, botão brand
- Homepage: hero section, grid cards com progress badge
- Player: sidebar com borda brand na aula ativa
- `npx tsc --noEmit` zero erros

---

## Fase 3 — Admin Layout + Shell

**Objetivo**: Layout admin com sidebar 56px icon-only + navbar dark + tema light.

### 3.1 Criar `src/components/admin/` directory

### 3.2 Criar `src/components/admin/AdminSidebar.tsx` (Client Component)

```tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
// Usar Tooltip do shadcn v4 — LER src/components/ui/tooltip.tsx para API exata

const navItems = [
  { href: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
  { href: '/admin/plataforma', icon: '🎓', label: 'Plataforma' },
  { href: '/admin/alunos', icon: '👥', label: 'Alunos' },
  { href: '/admin/relatorios', icon: '📈', label: 'Relatórios' },
  { href: '/admin/avaliacoes', icon: '📝', label: 'Avaliações' },
]

interface AdminSidebarProps {
  adminName: string
}

export function AdminSidebar({ adminName }: AdminSidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-14 bg-white border-r border-gray-200 z-40
                      flex flex-col items-center py-4 gap-1">
      {/* Logo */}
      <Link href="/admin/dashboard"
            className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center mb-4 shrink-0">
        <svg viewBox="0 0 24 24" className="w-5 h-5 text-white fill-current">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
      </Link>

      {/* Nav items */}
      <div className="flex-1 flex flex-col gap-1 w-full px-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            /* [IMPLEMENTADOR: envolver em Tooltip com label — usar API do tooltip.tsx gerado] */
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg
                         transition-colors mx-auto
                         ${isActive
                           ? 'bg-blue-50 text-blue-600'
                           : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700'}`}
            >
              {item.icon}
            </Link>
          )
        })}
      </div>

      {/* Admin avatar */}
      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center
                     text-white text-xs font-bold shrink-0"
           title={adminName}>
        {adminName.charAt(0).toUpperCase()}
      </div>
    </aside>
  )
}
```

### 3.3 Criar `src/app/admin/layout.tsx`

Substituir `src/app/admin/dashboard/page.tsx` (existente) apenas com conteúdo novo.
Criar o layout admin:

```tsx
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/login')

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar adminName={session.user.name ?? 'Admin'} />
      <div className="ml-14">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-11 bg-[#0f172a] flex items-center px-6">
          <span className="text-sm font-medium text-white/70">
            MIL Bijus — <span className="text-white">Admin</span>
          </span>
        </header>
        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
```

**IMPORTANTE**: Após criar `src/app/admin/layout.tsx`, o `src/app/admin/dashboard/page.tsx` já existente herda esse layout automaticamente. Ele deve ser simplificado para remover sua própria verificação de auth (o layout já faz isso).

### Verificação Fase 3
- `http://localhost:3000/admin/dashboard` mostra sidebar 56px + navbar dark + content area
- Sidebar ativa o item Dashboard
- `npx tsc --noEmit` zero erros

---

## Fase 4 — Admin Dashboard: Métricas e Gráficos

**Objetivo**: Página `/admin/dashboard` com cards de métricas, gráfico de logins, ranking.

### 4.1 Criar `src/app/admin/actions/metrics.ts` (Server — leitura)

```ts
import { prisma } from '@/lib/prisma'

export async function getDashboardMetrics(userId: string) {
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [
    totalStudents,
    activeStudents,
    totalCompleted,
    publishedCourses,
    recentStudents,
    loginLogs,
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'STUDENT' } }),
    prisma.user.count({
      where: { role: 'STUDENT', lastAccessAt: { gte: sevenDaysAgo } },
    }),
    prisma.lessonProgress.count({ where: { completed: true } }),
    prisma.course.count({ where: { status: 'PUBLISHED' } }),
    prisma.user.findMany({
      where: { role: 'STUDENT' },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, name: true, email: true, createdAt: true, lastAccessAt: true },
    }),
    prisma.loginLog.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
    }),
  ])

  // Agrupar logins por dia
  const loginsByDay: Record<string, number> = {}
  loginLogs.forEach(({ createdAt }) => {
    const day = createdAt.toISOString().split('T')[0]
    loginsByDay[day] = (loginsByDay[day] ?? 0) + 1
  })
  const loginChartData = Object.entries(loginsByDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-30)
    .map(([date, count]) => ({ date: date.slice(5), count })) // "MM-DD"

  // Ranking de engajamento (top 10)
  const students = await prisma.user.findMany({
    where: { role: 'STUDENT' },
    select: {
      id: true,
      name: true,
      email: true,
      _count: { select: { loginLogs: true } },
    },
    take: 50,
  })

  const completedByUser = await prisma.lessonProgress.groupBy({
    by: ['userId'],
    where: { completed: true },
    _count: { id: true },
  })
  const completedMap = Object.fromEntries(completedByUser.map((r) => [r.userId, r._count.id]))

  const passedByUser = await prisma.assessmentResponse.groupBy({
    by: ['userId'],
    where: { passed: true },
    _count: { id: true },
  })
  const passedMap = Object.fromEntries(passedByUser.map((r) => [r.userId, r._count.id]))

  const uniqueLoginDaysByUser = await prisma.loginLog.findMany({
    select: { userId: true, createdAt: true },
  })
  const loginDaysMap: Record<string, Set<string>> = {}
  uniqueLoginDaysByUser.forEach(({ userId, createdAt }) => {
    if (!loginDaysMap[userId]) loginDaysMap[userId] = new Set()
    loginDaysMap[userId].add(createdAt.toISOString().split('T')[0])
  })

  const ranking = students
    .map((s) => {
      const completed = completedMap[s.id] ?? 0
      const loginDays = loginDaysMap[s.id]?.size ?? 0
      const passed = passedMap[s.id] ?? 0
      const score = completed * 10 + loginDays * 3 + passed * 20
      return { ...s, score, completed, loginDays }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)

  return {
    totalStudents,
    activeStudents,
    totalCompleted,
    publishedCourses,
    recentStudents,
    loginChartData,
    ranking,
  }
}
```

### 4.2 Reescrever `src/app/admin/dashboard/page.tsx`

```tsx
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getDashboardMetrics } from '@/app/admin/actions/metrics'
import { LoginChart } from '@/components/admin/LoginChart'

export default async function AdminDashboard() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/login')

  const metrics = await getDashboardMetrics(session.user.id)

  const metricCards = [
    { label: 'Total de Alunos', value: metrics.totalStudents, icon: '👥', color: 'bg-blue-50 text-blue-600' },
    { label: 'Ativos (7 dias)', value: metrics.activeStudents, icon: '⚡', color: 'bg-green-50 text-green-600' },
    { label: 'Aulas Concluídas', value: metrics.totalCompleted, icon: '✅', color: 'bg-purple-50 text-purple-600' },
    { label: 'Cursos Publicados', value: metrics.publishedCourses, icon: '🎓', color: 'bg-orange-50 text-orange-600' },
  ]

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Visão geral da plataforma</p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {metricCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
            <div className={`inline-flex p-2 rounded-lg ${card.color} mb-3`}>
              <span className="text-xl">{card.icon}</span>
            </div>
            <div className="text-3xl font-bold text-slate-800">{card.value}</div>
            <div className="text-sm text-slate-500 mt-0.5">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        {/* Login chart */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Logins (últimos 30 dias)</h2>
          <LoginChart data={metrics.loginChartData} />
        </div>

        {/* Ranking */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Ranking de Engajamento</h2>
          <div className="space-y-2">
            {metrics.ranking.map((student, i) => (
              <div key={student.id} className="flex items-center gap-3">
                <span className="text-sm font-bold text-slate-400 w-5 shrink-0">{i + 1}</span>
                <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center
                                justify-center text-xs font-bold shrink-0">
                  {student.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{student.name}</p>
                  <p className="text-xs text-slate-400">{student.completed} aulas · {student.loginDays} dias</p>
                </div>
                <span className="text-sm font-bold text-blue-600 shrink-0">{student.score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent students */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Alunos Recentes</h2>
        <div className="divide-y divide-slate-100">
          {metrics.recentStudents.map((s) => (
            <div key={s.id} className="flex items-center gap-3 py-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center
                              justify-center text-xs font-bold shrink-0">
                {s.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">{s.name}</p>
                <p className="text-xs text-slate-400 truncate">{s.email}</p>
              </div>
              <span className="text-xs text-slate-400 shrink-0">
                {s.lastAccessAt ? `Acesso: ${s.lastAccessAt.toLocaleDateString('pt-BR')}` : 'Nunca acessou'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

### 4.3 Criar `src/components/admin/LoginChart.tsx` (Client Component)

```tsx
'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface LoginChartProps {
  data: { date: string; count: number }[]
}

export function LoginChart({ data }: LoginChartProps) {
  return (
    <ResponsiveContainer width="100%" height={160}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: '#94a3b8' }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 10, fill: '#94a3b8' }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px' }}
          itemStyle={{ color: '#3b82f6' }}
        />
        <Line
          type="monotone"
          dataKey="count"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: '#3b82f6' }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
```

### Verificação Fase 4
- Dashboard mostra 4 cards com valores reais do banco
- Gráfico de linha renderiza (pode ser 0 se sem logins)
- Ranking aparece (mesmo com scores 0)
- `npx tsc --noEmit` zero erros

---

## Fase 5 — Admin: Gestão de Conteúdo (CRUD Cursos/Módulos/Aulas)

**Objetivo**: CRUD completo de cursos, módulos e aulas via Server Actions.

### 5.1 Criar `src/app/admin/actions/content.ts`

```ts
'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

async function requireAdmin() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/login')
  return session
}

// --- COURSES ---
export async function createCourse(formData: FormData) {
  await requireAdmin()
  const name = formData.get('name') as string
  await prisma.course.create({
    data: {
      name,
      slug: slugify(name),
      description: (formData.get('description') as string) || null,
      banner: (formData.get('banner') as string) || null,
      status: 'DRAFT',
    },
  })
  revalidatePath('/admin/plataforma')
}

export async function updateCourse(courseId: string, formData: FormData) {
  await requireAdmin()
  const name = formData.get('name') as string
  await prisma.course.update({
    where: { id: courseId },
    data: {
      name,
      slug: slugify(name),
      description: (formData.get('description') as string) || null,
      banner: (formData.get('banner') as string) || null,
    },
  })
  revalidatePath('/admin/plataforma')
  revalidatePath('/admin/plataforma/[courseId]', 'page')
}

export async function toggleCourseStatus(courseId: string, currentStatus: 'DRAFT' | 'PUBLISHED') {
  await requireAdmin()
  await prisma.course.update({
    where: { id: courseId },
    data: { status: currentStatus === 'DRAFT' ? 'PUBLISHED' : 'DRAFT' },
  })
  revalidatePath('/admin/plataforma')
}

export async function deleteCourse(courseId: string) {
  await requireAdmin()
  await prisma.course.delete({ where: { id: courseId } })
  revalidatePath('/admin/plataforma')
}

// --- MODULES ---
export async function createModule(courseId: string, formData: FormData) {
  await requireAdmin()
  const title = formData.get('title') as string
  const lastModule = await prisma.module.findFirst({
    where: { courseId },
    orderBy: { order: 'desc' },
  })
  await prisma.module.create({
    data: {
      courseId,
      title,
      slug: slugify(title),
      order: (lastModule?.order ?? -1) + 1,
    },
  })
  revalidatePath('/admin/plataforma/[courseId]', 'page')
}

export async function updateModule(moduleId: string, courseId: string, formData: FormData) {
  await requireAdmin()
  const title = formData.get('title') as string
  await prisma.module.update({
    where: { id: moduleId },
    data: { title, slug: slugify(title) },
  })
  revalidatePath('/admin/plataforma/[courseId]', 'page')
}

export async function deleteModule(moduleId: string, courseId: string) {
  await requireAdmin()
  await prisma.module.delete({ where: { id: moduleId } })
  revalidatePath('/admin/plataforma/[courseId]', 'page')
}

// --- LESSONS ---
export async function createLesson(moduleId: string, courseId: string, formData: FormData) {
  await requireAdmin()
  const title = formData.get('title') as string
  const lastLesson = await prisma.lesson.findFirst({
    where: { moduleId },
    orderBy: { order: 'desc' },
  })
  await prisma.lesson.create({
    data: {
      moduleId,
      title,
      slug: slugify(title),
      youtubeUrl: (formData.get('youtubeUrl') as string) || null,
      durationSecs: formData.get('durationSecs') ? Number(formData.get('durationSecs')) : null,
      description: (formData.get('description') as string) || null,
      type: (formData.get('type') as 'VIDEO' | 'ASSESSMENT') || 'VIDEO',
      order: (lastLesson?.order ?? -1) + 1,
    },
  })
  revalidatePath('/admin/plataforma/[courseId]', 'page')
}

export async function updateLesson(lessonId: string, courseId: string, formData: FormData) {
  await requireAdmin()
  const title = formData.get('title') as string
  await prisma.lesson.update({
    where: { id: lessonId },
    data: {
      title,
      slug: slugify(title),
      youtubeUrl: (formData.get('youtubeUrl') as string) || null,
      durationSecs: formData.get('durationSecs') ? Number(formData.get('durationSecs')) : null,
      description: (formData.get('description') as string) || null,
      type: (formData.get('type') as 'VIDEO' | 'ASSESSMENT') || 'VIDEO',
    },
  })
  revalidatePath('/admin/plataforma/[courseId]', 'page')
}

export async function deleteLesson(lessonId: string, courseId: string) {
  await requireAdmin()
  await prisma.lesson.delete({ where: { id: lessonId } })
  revalidatePath('/admin/plataforma/[courseId]', 'page')
}
```

### 5.2 Criar `src/app/admin/plataforma/page.tsx`

```tsx
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { createCourse, toggleCourseStatus, deleteCourse } from '@/app/admin/actions/content'

export default async function PlataformaPage() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/login')

  const courses = await prisma.course.findMany({
    orderBy: { order: 'asc' },
    include: {
      _count: { select: { modules: true, enrollments: true } },
    },
  })

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Plataforma</h1>
          <p className="text-sm text-slate-500 mt-1">Gerencie cursos e conteúdo</p>
        </div>
        {/* Novo curso — form em dialog */}
        {/* [IMPLEMENTADOR: adicionar Dialog com form de criação aqui — usar API do dialog.tsx gerado] */}
      </div>

      {/* Course grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Add new card */}
        {/* [Form de criação de novo curso em dialog] */}

        {courses.map((course) => (
          <div key={course.id}
               className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden
                          hover:shadow-md transition-shadow">
            <div className="h-28 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center
                           justify-center relative">
              {course.banner ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={course.banner} alt={course.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl">🎓</span>
              )}
              <div className="absolute top-2 right-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                  ${course.status === 'PUBLISHED'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-slate-100 text-slate-600'}`}>
                  {course.status === 'PUBLISHED' ? 'Publicado' : 'Rascunho'}
                </span>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-slate-800 text-sm line-clamp-2 mb-1">{course.name}</h3>
              <p className="text-xs text-slate-400">
                {course._count.modules} módulos · {course._count.enrollments} alunos
              </p>
              <div className="flex items-center gap-2 mt-3">
                <Link
                  href={`/admin/plataforma/${course.id}`}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Editar
                </Link>
                <span className="text-slate-200">·</span>
                <form action={toggleCourseStatus.bind(null, course.id, course.status)}>
                  <button type="submit"
                          className="text-xs text-slate-500 hover:text-slate-700">
                    {course.status === 'PUBLISHED' ? 'Despublicar' : 'Publicar'}
                  </button>
                </form>
                <span className="text-slate-200">·</span>
                <form action={deleteCourse.bind(null, course.id)}>
                  <button type="submit"
                          className="text-xs text-red-500 hover:text-red-700"
                          onClick={(e) => {
                            if (!confirm('Confirmar exclusão?')) e.preventDefault()
                          }}>
                    Excluir
                  </button>
                </form>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

### 5.3 Criar `src/app/admin/plataforma/[courseId]/page.tsx`

Página de edição de curso com inline CRUD de módulos e aulas:
- Form de edição do curso no topo
- Lista de módulos com botão "+ Aula" em cada módulo
- Aulas como rows com campos inline editáveis

```tsx
import { auth } from '@/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import {
  updateCourse,
  createModule,
  deleteModule,
  createLesson,
  deleteLesson,
} from '@/app/admin/actions/content'

export default async function CourseEditPage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/login')

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      modules: {
        orderBy: { order: 'asc' },
        include: { lessons: { orderBy: { order: 'asc' } } },
      },
    },
  })
  if (!course) notFound()

  return (
    <div className="max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <Link href="/admin/plataforma" className="hover:text-slate-700">Plataforma</Link>
        <span>/</span>
        <span className="text-slate-700 font-medium">{course.name}</span>
      </nav>

      {/* Course edit form */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Dados do Curso</h2>
        <form action={updateCourse.bind(null, courseId)} className="space-y-3">
          <div>
            <label className="text-xs font-medium text-slate-500 block mb-1">Nome</label>
            <input name="name" defaultValue={course.name} required
                   className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 block mb-1">Descrição</label>
            <textarea name="description" defaultValue={course.description ?? ''}
                      rows={3}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-blue-500 resize-none" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 block mb-1">URL do Banner</label>
            <input name="banner" defaultValue={course.banner ?? ''}
                   placeholder="https://..."
                   className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <button type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            Salvar Alterações
          </button>
        </form>
      </div>

      {/* Modules */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">Módulos ({course.modules.length})</h2>
          <form action={createModule.bind(null, courseId)}
                onSubmit={(e) => {
                  const name = prompt('Nome do módulo:')
                  if (!name) { e.preventDefault(); return }
                  (e.currentTarget.querySelector('[name=title]') as HTMLInputElement).value = name
                }}>
            <input type="hidden" name="title" />
            <button type="submit"
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium border border-blue-200
                               hover:border-blue-400 px-3 py-1.5 rounded-lg transition-colors">
              + Novo Módulo
            </button>
          </form>
        </div>

        {course.modules.map((module) => (
          <div key={module.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
              <span className="text-sm font-semibold text-slate-700">{module.title}</span>
              <div className="flex items-center gap-3">
                <form action={createLesson.bind(null, module.id, courseId)}
                      onSubmit={(e) => {
                        const title = prompt('Título da aula:')
                        if (!title) { e.preventDefault(); return }
                        const url = prompt('YouTube URL (opcional):') ?? ''
                        ;(e.currentTarget.querySelector('[name=title]') as HTMLInputElement).value = title
                        ;(e.currentTarget.querySelector('[name=youtubeUrl]') as HTMLInputElement).value = url
                      }}>
                  <input type="hidden" name="title" />
                  <input type="hidden" name="youtubeUrl" />
                  <input type="hidden" name="type" value="VIDEO" />
                  <button type="submit" className="text-xs text-blue-600 hover:text-blue-700">+ Aula</button>
                </form>
                <form action={deleteModule.bind(null, module.id, courseId)}>
                  <button type="submit"
                          onClick={(e) => { if (!confirm('Excluir módulo e todas suas aulas?')) e.preventDefault() }}
                          className="text-xs text-red-500 hover:text-red-700">
                    Excluir
                  </button>
                </form>
              </div>
            </div>

            {module.lessons.length === 0 ? (
              <p className="text-xs text-slate-400 px-4 py-3">Nenhuma aula ainda.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {module.lessons.map((lesson) => (
                  <li key={lesson.id} className="flex items-center gap-3 px-4 py-2.5">
                    <span className="text-base shrink-0">{lesson.type === 'VIDEO' ? '▶️' : '📝'}</span>
                    <span className="flex-1 text-sm text-slate-700 truncate">{lesson.title}</span>
                    {lesson.durationSecs && (
                      <span className="text-xs text-slate-400 shrink-0">
                        {Math.floor(lesson.durationSecs / 60)}:{String(lesson.durationSecs % 60).padStart(2, '0')}
                      </span>
                    )}
                    <form action={deleteLesson.bind(null, lesson.id, courseId)}>
                      <button type="submit"
                              onClick={(e) => { if (!confirm('Excluir aula?')) e.preventDefault() }}
                              className="text-xs text-red-400 hover:text-red-600 shrink-0">
                        ✕
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
```

### Verificação Fase 5
- `/admin/plataforma` lista cursos com status badge
- Botão "Publicar/Despublicar" atualiza status
- `/admin/plataforma/[courseId]` exibe form + módulos + aulas
- Adicionar módulo via prompt funciona
- Adicionar aula via prompt funciona
- `npx tsc --noEmit` zero erros

---

## Fase 6 — Admin: Gestão de Alunos

**Objetivo**: Tabela de alunos com busca + página individual com ações.

### 6.1 Criar `src/app/admin/actions/users.ts`

```ts
'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

async function requireAdmin() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/login')
  return session
}

export async function blockUser(userId: string, block: boolean) {
  await requireAdmin()
  await prisma.user.update({ where: { id: userId }, data: { blocked: block } })
  revalidatePath('/admin/alunos')
  revalidatePath('/admin/alunos/[userId]', 'page')
}

export async function enrollUserInCourse(userId: string, courseId: string) {
  await requireAdmin()
  const existing = await prisma.userCourse.findUnique({
    where: { userId_courseId: { userId, courseId } },
  })
  if (!existing) {
    await prisma.userCourse.create({ data: { userId, courseId } })
  }
  revalidatePath('/admin/alunos/[userId]', 'page')
}

export async function createStudentNote(
  studentId: string,
  content: string,
  visibleToStudent: boolean
) {
  const session = await requireAdmin()
  await prisma.studentNote.create({
    data: {
      adminId: session.user.id,
      studentId,
      content,
      visibleToStudent,
    },
  })
  revalidatePath('/admin/alunos/[userId]', 'page')
}
```

### 6.2 Criar `src/app/admin/alunos/page.tsx`

```tsx
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function AlunosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>
}) {
  const { q, status } = await searchParams  // ← await obrigatório no Next.js 16
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/login')

  const students = await prisma.user.findMany({
    where: {
      role: 'STUDENT',
      ...(q ? {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
        ],
      } : {}),
      ...(status === 'blocked' ? { blocked: true } : {}),
      ...(status === 'active' ? { blocked: false } : {}),
    },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { courses: true } } },
  })

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Alunos</h1>
          <p className="text-sm text-slate-500 mt-1">{students.length} aluno(s) encontrado(s)</p>
        </div>
      </div>

      {/* Search */}
      <form className="mb-4 flex gap-2">
        <input
          name="q"
          defaultValue={q ?? ''}
          placeholder="Buscar por nome ou email..."
          className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm
                     focus:outline-none focus:border-blue-500"
        />
        <select name="status" defaultValue={status ?? ''}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm
                           focus:outline-none focus:border-blue-500 bg-white">
          <option value="">Todos</option>
          <option value="active">Ativos</option>
          <option value="blocked">Bloqueados</option>
        </select>
        <button type="submit"
                className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700">
          Filtrar
        </button>
      </form>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wide px-4 py-3">
                Aluno
              </th>
              <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wide px-4 py-3 hidden md:table-cell">
                Cursos
              </th>
              <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wide px-4 py-3 hidden lg:table-cell">
                Último Acesso
              </th>
              <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wide px-4 py-3">
                Status
              </th>
              <th className="px-4 py-3 w-12" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.map((student) => (
              <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center
                                   justify-center text-xs font-bold shrink-0">
                      {student.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">{student.name}</p>
                      <p className="text-xs text-slate-400 truncate">{student.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className="text-sm text-slate-600">{student._count.courses}</span>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <span className="text-sm text-slate-500">
                    {student.lastAccessAt
                      ? student.lastAccessAt.toLocaleDateString('pt-BR')
                      : '—'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                    ${student.blocked
                      ? 'bg-red-100 text-red-600'
                      : 'bg-green-100 text-green-600'}`}>
                    {student.blocked ? 'Bloqueado' : 'Ativo'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/alunos/${student.id}`}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                    Ver
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

### 6.3 Criar `src/app/admin/alunos/[userId]/page.tsx`

```tsx
import { auth } from '@/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { blockUser, enrollUserInCourse, createStudentNote } from '@/app/admin/actions/users'

export default async function AlunoPage({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  const { userId } = await params
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/login')

  const student = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      courses: {
        include: {
          course: {
            include: {
              modules: {
                include: {
                  lessons: {
                    include: { progress: { where: { userId } } },
                  },
                },
              },
            },
          },
        },
      },
      loginLogs: { orderBy: { createdAt: 'desc' }, take: 30 },
      notesAboutMe: { include: { admin: { select: { name: true } } }, orderBy: { updatedAt: 'desc' } },
    },
  })
  if (!student) notFound()

  const availableCourses = await prisma.course.findMany({
    where: {
      status: 'PUBLISHED',
      enrollments: { none: { userId } },
    },
  })

  return (
    <div className="max-w-3xl mx-auto">
      <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <Link href="/admin/alunos" className="hover:text-slate-700">Alunos</Link>
        <span>/</span>
        <span className="text-slate-700 font-medium">{student.name}</span>
      </nav>

      {/* Profile card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-4">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center
                         justify-center text-2xl font-bold shrink-0">
            {student.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-slate-800">{student.name}</h1>
            <p className="text-sm text-slate-500">{student.email}</p>
            {student.cpf && <p className="text-sm text-slate-400 mt-0.5">CPF: {student.cpf}</p>}
            <div className="flex items-center gap-3 mt-2">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                ${student.blocked ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                {student.blocked ? 'Bloqueado' : 'Ativo'}
              </span>
              <span className="text-xs text-slate-400">
                Cadastro: {student.createdAt.toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>
        </div>

        {/* Block/Unblock action */}
        <form action={blockUser.bind(null, userId, !student.blocked)}>
          <button type="submit"
                  className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors
                    ${student.blocked
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-red-600 hover:bg-red-700 text-white'}`}>
            {student.blocked ? 'Desbloquear Acesso' : 'Bloquear Acesso'}
          </button>
        </form>
      </div>

      {/* Courses progress */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-700">Cursos Matriculados</h2>
          {availableCourses.length > 0 && (
            <form action={async (fd: FormData) => {
              'use server'
              const courseId = fd.get('courseId') as string
              await enrollUserInCourse(userId, courseId)
            }}>
              <div className="flex items-center gap-2">
                <select name="courseId"
                        className="text-xs rounded border border-slate-200 px-2 py-1 bg-white">
                  {availableCourses.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <button type="submit"
                        className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
                  Matricular
                </button>
              </div>
            </form>
          )}
        </div>

        {student.courses.length === 0 ? (
          <p className="text-sm text-slate-400">Nenhum curso.</p>
        ) : (
          <div className="space-y-3">
            {student.courses.map(({ course }) => {
              const allLessons = course.modules.flatMap((m) => m.lessons)
              const completed = allLessons.filter((l) => l.progress.some((p) => p.completed)).length
              const total = allLessons.length
              const percent = total > 0 ? Math.round((completed / total) * 100) : 0
              return (
                <div key={course.id} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{course.name}</p>
                    <p className="text-xs text-slate-400">{completed}/{total} aulas</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full transition-all"
                           style={{ width: `${percent}%` }} />
                    </div>
                    <span className="text-xs text-slate-500 w-8 text-right">{percent}%</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Notas do Admin</h2>
        <form action={async (fd: FormData) => {
          'use server'
          const content = fd.get('content') as string
          if (content?.trim()) await createStudentNote(userId, content, false)
        }} className="flex gap-2 mb-4">
          <input name="content" placeholder="Adicionar nota interna..."
                 className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm
                            focus:outline-none focus:border-blue-500" />
          <button type="submit"
                  className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Salvar
          </button>
        </form>

        {student.notesAboutMe.length === 0 ? (
          <p className="text-sm text-slate-400">Nenhuma nota.</p>
        ) : (
          <div className="space-y-3">
            {student.notesAboutMe.map((note) => (
              <div key={note.id} className="rounded-lg bg-slate-50 border border-slate-100 p-3">
                <p className="text-sm text-slate-700">{note.content}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {note.admin.name} · {note.updatedAt.toLocaleDateString('pt-BR')}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

### Verificação Fase 6
- `/admin/alunos` lista alunos com busca por nome/email
- Filtro por status funciona
- `/admin/alunos/[userId]` mostra detalhes + cursos + notas
- Botão bloquear/desbloquear atualiza status
- Matricular em curso cria UserCourse
- `npx tsc --noEmit` zero erros

---

## Fase 7 — Admin: Relatórios e Avaliações

### 7.1 Criar `src/app/admin/relatorios/page.tsx`

```tsx
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export default async function RelatoriosPage() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/login')

  const courses = await prisma.course.findMany({
    where: { status: 'PUBLISHED' },
    include: {
      enrollments: {
        include: {
          user: {
            include: {
              progress: {
                where: { completed: true },
              },
            },
          },
        },
      },
      modules: { include: { lessons: true } },
    },
  })

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Relatórios</h1>
        <p className="text-sm text-slate-500 mt-1">Progresso dos alunos por curso</p>
      </div>

      <div className="space-y-6">
        {courses.map((course) => {
          const totalLessons = course.modules.flatMap((m) => m.lessons).length

          return (
            <div key={course.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-slate-800">{course.name}</h2>
                  <p className="text-xs text-slate-400 mt-0.5">{totalLessons} aulas · {course.enrollments.length} alunos</p>
                </div>
              </div>

              {course.enrollments.length === 0 ? (
                <p className="px-5 py-3 text-sm text-slate-400">Nenhum aluno matriculado.</p>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="text-left text-xs font-medium text-slate-400 px-5 py-2.5">Aluno</th>
                      <th className="text-left text-xs font-medium text-slate-400 px-5 py-2.5">Progresso</th>
                      <th className="text-right text-xs font-medium text-slate-400 px-5 py-2.5">%</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {course.enrollments.map(({ user }) => {
                      const userCompleted = user.progress.filter((p) =>
                        course.modules.flatMap((m) => m.lessons).some((l) => l.id === p.lessonId)
                      ).length
                      const percent = totalLessons > 0
                        ? Math.round((userCompleted / totalLessons) * 100)
                        : 0

                      return (
                        <tr key={user.id} className="hover:bg-slate-50">
                          <td className="px-5 py-2.5">
                            <p className="text-sm font-medium text-slate-700">{user.name}</p>
                            <p className="text-xs text-slate-400">{user.email}</p>
                          </td>
                          <td className="px-5 py-2.5">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full"
                                     style={{ width: `${percent}%` }} />
                              </div>
                              <span className="text-xs text-slate-500 shrink-0">{userCompleted}/{totalLessons}</span>
                            </div>
                          </td>
                          <td className="px-5 py-2.5 text-right">
                            <span className={`text-xs font-semibold
                              ${percent === 100 ? 'text-green-600' : percent > 50 ? 'text-blue-600' : 'text-slate-500'}`}>
                              {percent}%
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

### 7.2 Criar `src/app/admin/avaliacoes/page.tsx`

```tsx
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export default async function AvaliacoesPage() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/login')

  const assessments = await prisma.assessment.findMany({
    include: {
      lesson: { include: { module: { include: { course: true } } } },
      responses: true,
    },
    orderBy: { lesson: { module: { course: { name: 'asc' } } } },
  })

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Avaliações</h1>
        <p className="text-sm text-slate-500 mt-1">{assessments.length} avaliação(ões)</p>
      </div>

      {assessments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 text-center">
          <p className="text-slate-400">Nenhuma avaliação criada ainda.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wide px-5 py-3">
                  Avaliação
                </th>
                <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wide px-5 py-3 hidden md:table-cell">
                  Curso
                </th>
                <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wide px-5 py-3">
                  Respostas
                </th>
                <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wide px-5 py-3">
                  Aprovação
                </th>
                <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wide px-5 py-3">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {assessments.map((a) => {
                const total = a.responses.length
                const passed = a.responses.filter((r) => r.passed).length
                const passRate = total > 0 ? Math.round((passed / total) * 100) : 0

                return (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <p className="text-sm font-medium text-slate-700">{a.title}</p>
                      <p className="text-xs text-slate-400">{a.lesson.title}</p>
                    </td>
                    <td className="px-5 py-3 hidden md:table-cell">
                      <p className="text-sm text-slate-600 truncate max-w-[200px]">
                        {a.lesson.module.course.name}
                      </p>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-sm text-slate-600">{total}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-sm font-medium
                        ${passRate >= 70 ? 'text-green-600' : passRate > 0 ? 'text-orange-600' : 'text-slate-400'}`}>
                        {total > 0 ? `${passRate}%` : '—'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                        ${a.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-slate-100 text-slate-600'}`}>
                        {a.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
```

### Verificação Fase 7
- `/admin/relatorios` lista cursos com progresso por aluno
- `/admin/avaliacoes` lista avaliações com taxa de aprovação
- `npx tsc --noEmit` zero erros

---

## Fase 8 — Verificação Final

### 8.1 TypeScript
```bash
npx tsc --noEmit
```
Zero erros esperados.

### 8.2 Anti-patterns
```bash
# params síncronos (proibido no v16)
grep -rn "params\.[a-zA-Z]" src/app/admin/ src/app/(student)/

# searchParams síncronos
grep -rn "searchParams\.[a-zA-Z]" src/app/

# signOut de @/auth em client components
grep -rn "from '@/auth'" src/components/

# revalidateTag sem segundo argumento
grep -rn "revalidateTag(" src/
```

### 8.3 Runtime — checklist

**Student portal:**
- [ ] `/login` → fundo dark, tabs Email/CPF, botão brand (hot pink)
- [ ] `/homepage` → hero + grid de cards com progress badge
- [ ] `/curso/modulo-boas-vindas` → lista de módulos/aulas
- [ ] Player + sidebar com aula ativa bordada de brand
- [ ] Like/Favorito funcionam
- [ ] `/favoritos` → lista ou empty state

**Admin:**
- [ ] `/admin/dashboard` → 4 cards de métricas + gráfico + ranking
- [ ] Sidebar 56px com ícones e nav ativo
- [ ] `/admin/plataforma` → grid de cursos
- [ ] `/admin/plataforma/[courseId]` → editar curso + módulos + aulas
- [ ] Criar módulo e aula funcionam
- [ ] `/admin/alunos` → tabela com search
- [ ] `/admin/alunos/[userId]` → detalhes + bloquear + notas
- [ ] `/admin/relatorios` → tabela de progresso
- [ ] `/admin/avaliacoes` → lista de avaliações

---

## Notas para o Executor

### Sobre Tabs da página de Login
Após instalar `tabs`, ler `src/components/ui/tabs.tsx` — shadcn v4 usa Base UI. A API esperada (Base UI Tabs):
```tsx
<Tabs.Root value={tab} onValueChange={(v) => setTab(v as 'email' | 'cpf')}>
  <Tabs.List>
    <Tabs.Tab value="email">Email</Tabs.Tab>
    <Tabs.Tab value="cpf">CPF</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel value="email">...</Tabs.Panel>
  <Tabs.Panel value="cpf">...</Tabs.Panel>
</Tabs.Root>
```
**Mas confirmar no arquivo gerado — pode ser diferente.**

### Sobre recharts no Next.js (Server Components)
recharts é uma biblioteca cliente. O `LoginChart.tsx` DEVE ter `'use client'`. Importar de componentes server vai causar erro — já está correto no plano.

### Sobre Server Actions inline (dentro de page.tsx)
Em Next.js 16, Server Actions inline em Server Components funcionam:
```tsx
// Dentro de um Server Component (page.tsx):
async function minhaAction(formData: FormData) {
  'use server'
  // OK
}
```
Mas se o mesmo form for usado em um Client Component, a action deve estar em arquivo separado com `'use server'` no topo.

### Sobre Admin Layout conflito com Dashboard page existente
O `src/app/admin/dashboard/page.tsx` existente faz sua própria verificação de auth. Após criar `src/app/admin/layout.tsx`, essa verificação no page.tsx é redundante mas não prejudicial — pode ser removida para simplificar.

### Sobre Node.js runtime do proxy (Next.js 16)
O `src/proxy.ts` usa `auth()` da NextAuth — funciona em Node.js runtime (padrão no v16). Não adicionar configuração de runtime ao proxy.
