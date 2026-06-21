# Plano Fase 2 — Portal do Colaborador

## Contexto
Clone da plataforma The Members. Next.js 16.2.9 + TypeScript + Tailwind v4 + shadcn/ui v4 + Prisma v5 + NextAuth v5.

**Diretório**: `d:\Projetos\Learn_plataform`  
**Alias**: `@/*` → `./src/*`  
**Proxy**: `src/proxy.ts` (Next.js 16 — não alterar)

---

## APIs Confirmadas (Phase 0 — Documentation Discovery)

### Next.js 16 — Breaking Changes Críticos

Fonte: `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/page.md`

**`params` e `searchParams` são Promises em v16** — acesso síncrono foi removido:
```tsx
// CORRETO — Server Component assíncrono
export default async function Page({
  params,
}: {
  params: Promise<{ courseSlug: string; lessonSlug: string; lessonId: string }>
}) {
  const { courseSlug, lessonSlug, lessonId } = await params
}

// CORRETO — Client Component
'use client'
import { use } from 'react'
export default function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
}

// CORRETO — dentro de Client Component que não tem params como prop
'use client'
import { useParams } from 'next/navigation'
const params = useParams<{ lessonId: string }>()
```

**Importações confirmadas:**
```ts
import { redirect } from 'next/navigation'           // Server Components
import { useRouter, usePathname, useParams } from 'next/navigation'  // Client Components
import { auth } from '@/auth'                          // Servidor
import { signOut } from 'next-auth/react'              // Cliente
import { prisma } from '@/lib/prisma'                  // Servidor
```

**Anti-pattern — proibido em v16:**
```tsx
// ❌ ERRADO — params síncrono foi removido
export default function Page({ params }: { params: { slug: string } }) {
  const slug = params.slug  // TypeError em v16
}
```

### shadcn/ui v4 — Componentes Instalados

Fonte: `src/components/ui/` (listado via Glob)

**Instalados**: Button, Input, Card, Label  
**Faltam**: Progress, Accordion, Separator, Badge, Avatar, Tooltip

Instalar todos de uma vez:
```bash
npx shadcn@latest add progress accordion separator badge avatar tooltip
```

Após instalar, **ler os arquivos gerados** — shadcn v4 usa `@base-ui/react` em vez de Radix. As props podem ser diferentes do v2/v3. Sempre copiar do arquivo gerado.

### YouTube IFrame API

Fonte: conhecimento consolidado + verificação de que nenhum pacote existe no projeto.

**Instalar tipo dev:**
```bash
npm install --save-dev @types/youtube
```

**Padrão de carregamento em Client Component:**
```tsx
'use client'
import { useEffect, useRef } from 'react'

interface YouTubePlayerProps {
  videoId: string
  lessonId: string
  durationSecs: number
  initialWatchedSecs?: number
}

export function YouTubePlayer({ videoId, lessonId, durationSecs, initialWatchedSecs = 0 }: YouTubePlayerProps) {
  const playerRef = useRef<YT.Player | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!document.getElementById('youtube-iframe-api')) {
      const tag = document.createElement('script')
      tag.id = 'youtube-iframe-api'
      tag.src = 'https://www.youtube.com/iframe_api'
      document.head.appendChild(tag)
    }

    const prev = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      prev?.()
      if (!containerRef.current) return
      playerRef.current = new YT.Player(containerRef.current, {
        videoId,
        playerVars: { controls: 1, rel: 0, modestbranding: 1, start: initialWatchedSecs },
        events: { onStateChange: (e) => { /* state tracking */ } },
      })
    }
    if (window.YT?.Player) window.onYouTubeIframeAPIReady()

    return () => { playerRef.current?.destroy(); playerRef.current = null }
  }, [videoId])

  // Intervalo de 5s para salvar progresso
  useEffect(() => {
    const interval = setInterval(async () => {
      const player = playerRef.current
      if (!player) return
      if (player.getPlayerState() !== YT.PlayerState.PLAYING) return
      const watchedSecs = Math.floor(player.getCurrentTime())
      const totalDuration = player.getDuration() || durationSecs
      const completed = totalDuration > 0 && watchedSecs >= totalDuration * 0.8
      await fetch(`/api/lessons/${lessonId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ watchedSecs, completed }),
      })
    }, 5000)
    return () => clearInterval(interval)
  }, [lessonId, durationSecs])

  return <div ref={containerRef} className="w-full aspect-video" />
}
```

**Métodos YT.Player usados:**
- `getCurrentTime()` → `number` (segundos)
- `getDuration()` → `number` (segundos, pode ser 0 antes de carregar)
- `getPlayerState()` → `YT.PlayerState` enum (PLAYING = 1)

### Prisma v5 — Queries confirmadas

Fonte: `prisma/schema.prisma` + `src/lib/prisma.ts`

```ts
// Cursos matriculados do usuário com progresso
const enrollments = await prisma.userCourse.findMany({
  where: { userId },
  include: {
    course: {
      include: {
        modules: {
          include: { lessons: { include: { progress: { where: { userId } } } } },
          orderBy: { order: 'asc' },
        },
      },
    },
  },
})

// Upsert de progresso
await prisma.lessonProgress.upsert({
  where: { userId_lessonId: { userId, lessonId } },
  update: { watchedSecs, ...(completed ? { completed, completedAt: new Date() } : {}) },
  create: { userId, lessonId, watchedSecs, completed, completedAt: completed ? new Date() : null },
})

// Toggle Like
const existing = await prisma.like.findUnique({ where: { userId_lessonId: { userId, lessonId } } })
if (existing) {
  if (existing.type === type) {
    await prisma.like.delete({ where: { userId_lessonId: { userId, lessonId } } })
  } else {
    await prisma.like.update({ where: { userId_lessonId: { userId, lessonId } }, data: { type } })
  }
} else {
  await prisma.like.create({ data: { userId, lessonId, type } })
}

// Toggle Favorite
const existing = await prisma.favorite.findUnique({ where: { userId_lessonId: { userId, lessonId } } })
if (existing) {
  await prisma.favorite.delete({ where: { userId_lessonId: { userId, lessonId } } })
} else {
  await prisma.favorite.create({ data: { userId, lessonId } })
}
```

**Anti-pattern — proibido:**
```ts
// ❌ ERRADO — Favorite não tem campo 'id' único para delete por PK
await prisma.favorite.delete({ where: { id: '...' } })
// ✅ CORRETO — usar unique composto
await prisma.favorite.delete({ where: { userId_lessonId: { userId, lessonId } } })
```

---

## Estrutura de Arquivos a Criar

```
src/app/(student)/
  layout.tsx                                          ← header compartilhado
  homepage/
    page.tsx                                          ← substituir placeholder
  curso/
    [courseSlug]/
      page.tsx                                        ← visão geral do curso
      [lessonSlug]/
        [lessonId]/
          page.tsx                                    ← player de vídeo
  favoritos/
    page.tsx

src/app/api/lessons/
  [lessonId]/
    progress/route.ts
    like/route.ts
    favorite/route.ts

src/components/
  student/
    Header.tsx                                        ← Client Component (logout)
    CourseCard.tsx                                    ← Server ou Client
    LessonSidebar.tsx                                 ← Client (highlight aula ativa)
    YouTubePlayer.tsx                                 ← Client Component
    LikeButtons.tsx                                   ← Client (toggle state)
    FavoriteButton.tsx                                ← Client (toggle state)

src/lib/
  youtube.ts                                          ← extractVideoId utility
```

---

## Fase 1 — Instalar Dependências e Componentes shadcn

**Objetivo**: Todos os componentes shadcn necessários instalados, `@types/youtube` disponível.

### Tarefas

1. Instalar `@types/youtube`:
   ```bash
   npm install --save-dev @types/youtube
   ```

2. Instalar componentes shadcn (um de cada vez se houver prompt interativo):
   ```bash
   npx shadcn@latest add progress
   npx shadcn@latest add accordion
   npx shadcn@latest add separator
   npx shadcn@latest add badge
   npx shadcn@latest add avatar
   npx shadcn@latest add tooltip
   ```
   Se algum pedir confirmação, confirmar com "y".

3. Após instalar cada componente, **ler o arquivo gerado** em `src/components/ui/` para confirmar as props exatas. Shadcn v4 usa Base UI (`@base-ui/react`) em vez de Radix — não assumir props de v2/v3.

### Verificação
- `src/components/ui/progress.tsx` existe
- `src/components/ui/accordion.tsx` existe
- `node_modules/@types/youtube` existe
- `npx tsc --noEmit` sem erros

---

## Fase 2 — Layout de Grupo (student) e Header

**Objetivo**: Route group `(student)` com layout compartilhado; header com logo, usuário e logout.

### Tarefas

1. Criar `src/app/(student)/layout.tsx` (Server Component que lê a sessão):
   ```tsx
   import { auth } from '@/auth'
   import { redirect } from 'next/navigation'
   import { Header } from '@/components/student/Header'

   export default async function StudentLayout({
     children,
   }: {
     children: React.ReactNode
   }) {
     const session = await auth()
     if (!session) redirect('/login')

     return (
       <div className="min-h-screen bg-gray-950 text-white">
         <Header user={{ name: session.user.name ?? '', email: session.user.email ?? '' }} />
         <main>{children}</main>
       </div>
     )
   }
   ```

2. Criar `src/components/student/Header.tsx` (Client Component para logout):
   ```tsx
   'use client'
   import Link from 'next/link'
   import { signOut } from 'next-auth/react'
   import { Button } from '@/components/ui/button'

   interface HeaderProps {
     user: { name: string; email: string }
   }

   export function Header({ user }: HeaderProps) {
     return (
       <header className="fixed top-0 left-0 right-0 z-50 border-b border-gray-800 bg-gray-950/95 backdrop-blur">
         <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
           <Link href="/homepage" className="text-xl font-bold tracking-tight">
             MIL Bijus Treinamentos
           </Link>
           <nav className="flex items-center gap-4">
             <Link href="/homepage" className="text-sm text-gray-400 hover:text-white transition-colors">
               Início
             </Link>
             <Link href="/favoritos" className="text-sm text-gray-400 hover:text-white transition-colors">
               Favoritos
             </Link>
             <span className="text-sm text-gray-300">{user.name}</span>
             <Button
               variant="outline"
               size="sm"
               onClick={() => signOut({ callbackUrl: '/login' })}
             >
               Sair
             </Button>
           </nav>
         </div>
       </header>
     )
   }
   ```

3. Mover o conteúdo de `src/app/homepage/page.tsx` para `src/app/(student)/homepage/page.tsx` (criar o arquivo no novo local, deletar o antigo). O proxy já funciona com a nova rota pois `/homepage` permanece o mesmo URL.

### Verificação
- `http://localhost:3000/homepage` ainda funciona (mesma URL, diferente localização)
- Header aparece com link para /homepage e /favoritos
- Botão Sair chama signOut
- `npx tsc --noEmit` sem erros

---

## Fase 3 — Homepage Real com Cards de Cursos

**Objetivo**: Substituir o placeholder por uma lista real de cursos matriculados com progress bar.

### Tarefas

1. Criar `src/lib/youtube.ts`:
   ```typescript
   export function extractVideoId(url: string): string | null {
     const patterns = [
       /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
       /youtube\.com\/v\/([^&\n?#]+)/,
     ]
     for (const pattern of patterns) {
       const match = url.match(pattern)
       if (match) return match[1]
     }
     return null
   }
   ```

2. Criar `src/app/(student)/homepage/page.tsx` (substituir o placeholder):
   ```tsx
   import { auth } from '@/auth'
   import { redirect } from 'next/navigation'
   import { prisma } from '@/lib/prisma'
   import Link from 'next/link'
   import { Progress } from '@/components/ui/progress'
   import { Card, CardContent } from '@/components/ui/card'

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

     return (
       <div className="mx-auto max-w-7xl px-4 pt-24 pb-12">
         <h1 className="mb-8 text-2xl font-bold">Meus Cursos</h1>
         {enrollments.length === 0 ? (
           <p className="text-gray-400">Você ainda não está matriculada em nenhum curso.</p>
         ) : (
           <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
             {enrollments.map(({ course }) => {
               const allLessons = course.modules.flatMap((m) => m.lessons)
               const completed = allLessons.filter(
                 (l) => l.progress.some((p) => p.completed)
               ).length
               const total = allLessons.length
               const percent = total > 0 ? Math.round((completed / total) * 100) : 0

               return (
                 <Link key={course.id} href={`/curso/${course.slug}`}>
                   <Card className="cursor-pointer overflow-hidden transition-transform hover:scale-[1.02]">
                     {course.banner ? (
                       <img src={course.banner} alt={course.name} className="h-40 w-full object-cover" />
                     ) : (
                       <div className="flex h-40 items-center justify-center bg-gray-800 text-4xl">🎓</div>
                     )}
                     <CardContent className="pt-4">
                       <h2 className="mb-2 font-semibold">{course.name}</h2>
                       <div className="flex items-center gap-2">
                         <Progress value={percent} className="flex-1" />
                         <span className="text-sm text-gray-400">{percent}%</span>
                       </div>
                       <p className="mt-1 text-xs text-gray-500">
                         {completed}/{total} aulas concluídas
                       </p>
                     </CardContent>
                   </Card>
                 </Link>
               )
             })}
           </div>
         )}
       </div>
     )
   }
   ```

### Verificação
- `http://localhost:3000/homepage` exibe "Módulo de Boas-Vindas" com 0% de progresso
- Card tem progress bar funcional
- Clicar no card navega para `/curso/modulo-boas-vindas`
- `npx tsc --noEmit` sem erros

---

## Fase 4 — Página do Curso (Listagem de Módulos/Aulas)

**Objetivo**: `/curso/[courseSlug]` mostra o curso com módulos colapsáveis e aulas.

### Tarefas

1. Após instalar `accordion` na Fase 1, ler `src/components/ui/accordion.tsx` para confirmar as props exatas do componente. Shadcn v4 usa `@base-ui/react` — não assumir API Radix. **Copiar o padrão de uso do arquivo gerado.**

2. Criar `src/app/(student)/curso/[courseSlug]/page.tsx`:
   ```tsx
   import { auth } from '@/auth'
   import { redirect, notFound } from 'next/navigation'
   import { prisma } from '@/lib/prisma'
   import Link from 'next/link'

   export default async function CoursePage({
     params,
   }: {
     params: Promise<{ courseSlug: string }>
   }) {
     const { courseSlug } = await params  // ← await obrigatório no Next.js 16
     const session = await auth()
     if (!session) redirect('/login')

     const course = await prisma.course.findUnique({
       where: { slug: courseSlug },
       include: {
         modules: {
           orderBy: { order: 'asc' },
           include: {
             lessons: {
               orderBy: { order: 'asc' },
               include: {
                 progress: { where: { userId: session.user.id } },
               },
             },
           },
         },
       },
     })

     if (!course) notFound()

     // Verificar matrícula
     const enrollment = await prisma.userCourse.findUnique({
       where: { userId_courseId: { userId: session.user.id, courseId: course.id } },
     })
     if (!enrollment) redirect('/homepage')

     return (
       <div className="mx-auto max-w-4xl px-4 pt-24 pb-12">
         {/* Breadcrumb */}
         <nav className="mb-6 flex items-center gap-2 text-sm text-gray-400">
           <Link href="/homepage" className="hover:text-white">Início</Link>
           <span>/</span>
           <span className="text-white">{course.name}</span>
         </nav>

         <h1 className="mb-2 text-3xl font-bold">{course.name}</h1>
         {course.description && (
           <p className="mb-8 text-gray-400">{course.description}</p>
         )}

         {/* Módulos — usar Accordion do shadcn v4 instalado na Fase 1 */}
         {/* IMPORTANTE: ler src/components/ui/accordion.tsx após instalar para confirmar API */}
         <div className="space-y-4">
           {course.modules.map((module) => (
             <div key={module.id} className="rounded-lg border border-gray-800 overflow-hidden">
               <div className="bg-gray-900 px-4 py-3 font-semibold">{module.title}</div>
               <ul className="divide-y divide-gray-800">
                 {module.lessons.map((lesson) => {
                   const isDone = lesson.progress.some((p) => p.completed)
                   const duration = lesson.durationSecs
                     ? `${Math.floor(lesson.durationSecs / 60)}:${String(lesson.durationSecs % 60).padStart(2, '0')}`
                     : ''
                   return (
                     <li key={lesson.id}>
                       <Link
                         href={`/curso/${courseSlug}/${lesson.slug}/${lesson.id}`}
                         className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition-colors"
                       >
                         <span className="text-xl">{isDone ? '✅' : lesson.type === 'VIDEO' ? '▶️' : '📝'}</span>
                         <span className={`flex-1 text-sm ${isDone ? 'text-gray-400 line-through' : ''}`}>
                           {lesson.title}
                         </span>
                         {duration && <span className="text-xs text-gray-500">{duration}</span>}
                       </Link>
                     </li>
                   )
                 })}
               </ul>
             </div>
           ))}
         </div>
       </div>
     )
   }
   ```

### Verificação
- `http://localhost:3000/curso/modulo-boas-vindas` mostra 2 módulos com 3 aulas cada
- Breadcrumb "Início > Módulo de Boas-Vindas" funcional
- Aulas sem progresso mostram ▶️
- Clicar em uma aula navega para `/curso/modulo-boas-vindas/[lessonSlug]/[lessonId]`

---

## Fase 5 — Página da Aula com Player YouTube

**Objetivo**: Player de vídeo funcional com tracking de progresso, like e favorito.

### Tarefas

1. Criar `src/components/student/YouTubePlayer.tsx` (Client Component):
   Copiar o padrão documentado em "APIs Confirmadas" acima. Parâmetros: `videoId`, `lessonId`, `durationSecs`, `initialWatchedSecs`.

2. Criar `src/components/student/LikeButtons.tsx` (Client Component — toggle state):
   ```tsx
   'use client'
   import { useState } from 'react'
   import { Button } from '@/components/ui/button'

   interface LikeButtonsProps {
     lessonId: string
     initialLike: 'LIKE' | 'DISLIKE' | null
     likeCount: number
     dislikeCount: number
   }

   export function LikeButtons({ lessonId, initialLike, likeCount, dislikeCount }: LikeButtonsProps) {
     const [current, setCurrent] = useState<'LIKE' | 'DISLIKE' | null>(initialLike)
     const [counts, setCounts] = useState({ like: likeCount, dislike: dislikeCount })

     async function toggle(type: 'LIKE' | 'DISLIKE') {
       const res = await fetch(`/api/lessons/${lessonId}/like`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ type }),
       })
       if (!res.ok) return
       // Atualizar estado local otimisticamente
       if (current === type) {
         setCurrent(null)
         setCounts((c) => ({ ...c, [type.toLowerCase()]: c[type.toLowerCase() as 'like' | 'dislike'] - 1 }))
       } else {
         if (current) {
           setCounts((c) => ({ ...c, [current.toLowerCase()]: c[current.toLowerCase() as 'like' | 'dislike'] - 1 }))
         }
         setCurrent(type)
         setCounts((c) => ({ ...c, [type.toLowerCase()]: c[type.toLowerCase() as 'like' | 'dislike'] + 1 }))
       }
     }

     return (
       <div className="flex items-center gap-2">
         <Button variant={current === 'LIKE' ? 'default' : 'outline'} size="sm" onClick={() => toggle('LIKE')}>
           👍 {counts.like}
         </Button>
         <Button variant={current === 'DISLIKE' ? 'default' : 'outline'} size="sm" onClick={() => toggle('DISLIKE')}>
           👎 {counts.dislike}
         </Button>
       </div>
     )
   }
   ```

3. Criar `src/components/student/FavoriteButton.tsx` (Client Component — toggle):
   ```tsx
   'use client'
   import { useState } from 'react'
   import { Button } from '@/components/ui/button'

   export function FavoriteButton({ lessonId, initialFavorited }: { lessonId: string; initialFavorited: boolean }) {
     const [favorited, setFavorited] = useState(initialFavorited)

     async function toggle() {
       await fetch(`/api/lessons/${lessonId}/favorite`, { method: 'POST' })
       setFavorited((f) => !f)
     }

     return (
       <Button variant={favorited ? 'default' : 'outline'} size="sm" onClick={toggle}>
         {favorited ? '⭐ Favoritado' : '☆ Favoritar'}
       </Button>
     )
   }
   ```

4. Criar `src/app/(student)/curso/[courseSlug]/[lessonSlug]/[lessonId]/page.tsx`:
   ```tsx
   import { auth } from '@/auth'
   import { redirect, notFound } from 'next/navigation'
   import { prisma } from '@/lib/prisma'
   import { extractVideoId } from '@/lib/youtube'
   import { YouTubePlayer } from '@/components/student/YouTubePlayer'
   import { LikeButtons } from '@/components/student/LikeButtons'
   import { FavoriteButton } from '@/components/student/FavoriteButton'
   import Link from 'next/link'

   export default async function LessonPage({
     params,
   }: {
     params: Promise<{ courseSlug: string; lessonSlug: string; lessonId: string }>
   }) {
     const { courseSlug, lessonId } = await params  // ← await obrigatório no Next.js 16
     const session = await auth()
     if (!session) redirect('/login')

     const lesson = await prisma.lesson.findUnique({
       where: { id: lessonId },
       include: {
         module: {
           include: {
             course: {
               include: {
                 modules: {
                   orderBy: { order: 'asc' },
                   include: {
                     lessons: {
                       orderBy: { order: 'asc' },
                       include: { progress: { where: { userId: session.user.id } } },
                     },
                   },
                 },
               },
             },
           },
         },
         progress: { where: { userId: session.user.id } },
         likes: true,
         favorites: { where: { userId: session.user.id } },
       },
     })

     if (!lesson) notFound()

     const videoId = lesson.youtubeUrl ? extractVideoId(lesson.youtubeUrl) : null
     const userProgress = lesson.progress[0]
     const userLike = lesson.likes.find((l) => l.userId === session.user.id)
     const likeCount = lesson.likes.filter((l) => l.type === 'LIKE').length
     const dislikeCount = lesson.likes.filter((l) => l.type === 'DISLIKE').length
     const isFavorited = lesson.favorites.length > 0
     const course = lesson.module.course

     return (
       <div className="mx-auto max-w-7xl px-4 pt-20">
         {/* Breadcrumb */}
         <nav className="mb-4 flex items-center gap-2 text-sm text-gray-400 pt-4">
           <Link href="/homepage" className="hover:text-white">Início</Link>
           <span>/</span>
           <Link href={`/curso/${courseSlug}`} className="hover:text-white">{course.name}</Link>
           <span>/</span>
           <span className="text-white">{lesson.title}</span>
         </nav>

         <div className="flex gap-6">
           {/* Coluna principal — player */}
           <div className="flex-1 min-w-0">
             {videoId ? (
               <YouTubePlayer
                 videoId={videoId}
                 lessonId={lesson.id}
                 durationSecs={lesson.durationSecs ?? 0}
                 initialWatchedSecs={userProgress?.watchedSecs ?? 0}
               />
             ) : (
               <div className="aspect-video flex items-center justify-center bg-gray-800 rounded-lg text-gray-400">
                 Vídeo não disponível
               </div>
             )}

             <div className="mt-4">
               <h1 className="text-xl font-bold mb-2">{lesson.title}</h1>
               {lesson.description && (
                 <p className="text-gray-400 text-sm mb-4">{lesson.description}</p>
               )}
               <div className="flex items-center gap-3">
                 <LikeButtons
                   lessonId={lesson.id}
                   initialLike={userLike?.type ?? null}
                   likeCount={likeCount}
                   dislikeCount={dislikeCount}
                 />
                 <FavoriteButton lessonId={lesson.id} initialFavorited={isFavorited} />
               </div>
             </div>
           </div>

           {/* Sidebar — lista de módulos/aulas */}
           <aside className="w-80 shrink-0 hidden lg:block">
             <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto rounded-lg border border-gray-800">
               <div className="bg-gray-900 px-4 py-3 font-semibold text-sm">{course.name}</div>
               {course.modules.map((module) => (
                 <div key={module.id}>
                   <div className="bg-gray-800/50 px-4 py-2 text-xs font-medium text-gray-400 uppercase tracking-wide">
                     {module.title}
                   </div>
                   {module.lessons.map((l) => {
                     const isDone = l.progress.some((p) => p.completed)
                     const isActive = l.id === lesson.id
                     return (
                       <Link
                         key={l.id}
                         href={`/curso/${courseSlug}/${l.slug}/${l.id}`}
                         className={`flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                           isActive
                             ? 'bg-blue-900/40 text-blue-200'
                             : 'hover:bg-gray-800 text-gray-300'
                         }`}
                       >
                         <span>{isDone ? '✅' : '▶️'}</span>
                         <span className={isDone ? 'line-through text-gray-500' : ''}>{l.title}</span>
                       </Link>
                     )
                   })}
                 </div>
               ))}
             </div>
           </aside>
         </div>
       </div>
     )
   }
   ```

### Verificação
- Navegar para uma aula via `/curso/modulo-boas-vindas/11-bem-vinda-equipe/[lessonId]` — player YouTube aparece
- Player carrega o vídeo (rickroll placeholder)
- Após 5s de play, o console do servidor mostra request para `/api/lessons/.../progress` (404 ainda — APIs vêm na Fase 6)
- Botões de like e favorito aparecem (clique vai dar 404 até Fase 6)
- Sidebar mostra todos os módulos e aulas; aula atual destacada em azul

---

## Fase 6 — API Routes: Progresso, Like, Favorito

**Objetivo**: Três rotas POST que persistem ações do usuário no banco.

### Tarefas

1. Criar `src/app/api/lessons/[lessonId]/progress/route.ts`:
   ```typescript
   import { NextRequest, NextResponse } from 'next/server'
   import { auth } from '@/auth'
   import { prisma } from '@/lib/prisma'

   export async function POST(
     request: NextRequest,
     { params }: { params: Promise<{ lessonId: string }> }
   ) {
     const session = await auth()
     if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

     const { lessonId } = await params
     const { watchedSecs, completed } = await request.json()

     const progress = await prisma.lessonProgress.upsert({
       where: { userId_lessonId: { userId: session.user.id, lessonId } },
       update: {
         watchedSecs,
         ...(completed ? { completed: true, completedAt: new Date() } : {}),
       },
       create: {
         userId: session.user.id,
         lessonId,
         watchedSecs,
         completed: !!completed,
         completedAt: completed ? new Date() : null,
       },
     })

     return NextResponse.json({ ok: true, completed: progress.completed })
   }
   ```

2. Criar `src/app/api/lessons/[lessonId]/like/route.ts`:
   ```typescript
   import { NextRequest, NextResponse } from 'next/server'
   import { auth } from '@/auth'
   import { prisma } from '@/lib/prisma'

   export async function POST(
     request: NextRequest,
     { params }: { params: Promise<{ lessonId: string }> }
   ) {
     const session = await auth()
     if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

     const { lessonId } = await params
     const { type } = await request.json() // 'LIKE' | 'DISLIKE'

     const key = { userId: session.user.id, lessonId }
     const existing = await prisma.like.findUnique({ where: { userId_lessonId: key } })

     if (existing) {
       if (existing.type === type) {
         await prisma.like.delete({ where: { userId_lessonId: key } })
         return NextResponse.json({ action: 'removed' })
       }
       await prisma.like.update({ where: { userId_lessonId: key }, data: { type } })
       return NextResponse.json({ action: 'changed', type })
     }

     await prisma.like.create({ data: { ...key, type } })
     return NextResponse.json({ action: 'added', type })
   }
   ```

3. Criar `src/app/api/lessons/[lessonId]/favorite/route.ts`:
   ```typescript
   import { NextRequest, NextResponse } from 'next/server'
   import { auth } from '@/auth'
   import { prisma } from '@/lib/prisma'

   export async function POST(
     request: NextRequest,
     { params }: { params: Promise<{ lessonId: string }> }
   ) {
     const session = await auth()
     if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

     const { lessonId } = await params
     const key = { userId: session.user.id, lessonId }
     const existing = await prisma.favorite.findUnique({ where: { userId_lessonId: key } })

     if (existing) {
       await prisma.favorite.delete({ where: { userId_lessonId: key } })
       return NextResponse.json({ favorited: false })
     }

     await prisma.favorite.create({ data: key })
     return NextResponse.json({ favorited: true })
   }
   ```

### Verificação
- Assistir vídeo por 5+ segundos → LessonProgress criado no banco
- Ao atingir 80%+ → `completed = true` salvo
- Botão 👍 → Like criado; clicar de novo → Like removido
- Botão ⭐ → Favorite criado; clicar de novo → removido
- `npx tsc --noEmit` sem erros

---

## Fase 7 — Página de Favoritos

**Objetivo**: `/favoritos` lista todas as aulas favoritadas do usuário.

### Tarefas

1. Criar `src/app/(student)/favoritos/page.tsx`:
   ```tsx
   import { auth } from '@/auth'
   import { redirect } from 'next/navigation'
   import { prisma } from '@/lib/prisma'
   import Link from 'next/link'
   import { Card, CardContent } from '@/components/ui/card'

   export default async function Favoritos() {
     const session = await auth()
     if (!session) redirect('/login')

     const favorites = await prisma.favorite.findMany({
       where: { userId: session.user.id },
       include: {
         lesson: {
           include: {
             module: {
               include: { course: true },
             },
           },
         },
       },
       orderBy: { createdAt: 'desc' },
     })

     return (
       <div className="mx-auto max-w-7xl px-4 pt-24 pb-12">
         <h1 className="mb-8 text-2xl font-bold">Favoritos</h1>
         {favorites.length === 0 ? (
           <p className="text-gray-400">Nenhuma aula favoritada ainda.</p>
         ) : (
           <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
             {favorites.map(({ lesson }) => (
               <Link
                 key={lesson.id}
                 href={`/curso/${lesson.module.course.slug}/${lesson.slug}/${lesson.id}`}
               >
                 <Card className="cursor-pointer hover:border-gray-600 transition-colors">
                   {lesson.thumbnail ? (
                     <img src={lesson.thumbnail} alt={lesson.title} className="h-32 w-full object-cover" />
                   ) : (
                     <div className="flex h-32 items-center justify-center bg-gray-800 text-3xl">▶️</div>
                   )}
                   <CardContent className="pt-3">
                     <p className="text-xs text-gray-500 mb-1">{lesson.module.course.name}</p>
                     <h3 className="font-medium text-sm">{lesson.title}</h3>
                   </CardContent>
                 </Card>
               </Link>
             ))}
           </div>
         )}
       </div>
     )
   }
   ```

### Verificação
- `http://localhost:3000/favoritos` renderiza
- Após favoritar uma aula, ela aparece na lista
- Clicar leva à aula correta

---

## Fase 8 — Verificação Final

**Objetivo**: Provar que o portal do colaborador funciona end-to-end.

### Checklist

1. `npx tsc --noEmit` — sem erros TypeScript

2. Fluxo completo:
   - Login como `teste@plataforma.com / teste123`
   - `/ → /homepage` com card "Módulo de Boas-Vindas" (0%)
   - Clicar no card → `/curso/modulo-boas-vindas` com 2 módulos
   - Clicar em "1.1 - Bem-vinda à equipe" → player carrega
   - Play por 5s → POST para `/api/lessons/.../progress` retorna 200
   - Clicar 👍 → like salvo
   - Clicar ⭐ → favoritado
   - `/favoritos` → aula listada
   - Voltar para homepage → progress bar atualizada

3. Proteção de rotas:
   - Sair (signOut) → `/login`
   - Tentar `/homepage` sem auth → `/login`

4. Anti-patterns verificados:
   - Nenhum arquivo usa `params.slug` sem `await params` primeiro
   - Nenhum `import { signOut } from '@/auth'` em Client Components (deve ser `next-auth/react`)
   - Nenhum `tailwind.config.js` criado

---

## Notas para o Executor

### Sobre mover src/app/homepage/page.tsx
Deletar `src/app/homepage/page.tsx` após criar `src/app/(student)/homepage/page.tsx`. Ambos mapeiam para `/homepage` — só um pode existir.

### Sobre o Accordion (shadcn v4)
Após `npx shadcn@latest add accordion`, **ler `src/components/ui/accordion.tsx`** antes de usar. O shadcn v4 usa `@base-ui/react` e a API pode ser `Accordion.Root value={...} onValueChange={...}` em vez do padrão Radix `AccordionRoot`.

### Sobre params Promise no Next.js 16
Todo `params` e `searchParams` recebido como prop em pages e layouts DEVE ser awaited. Isso inclui Route Handlers (second argument `{ params }`).

### Sobre Likes — contagem
O schema não tem um campo de contagem cacheada. A contagem é calculada on-the-fly com `lesson.likes.filter(l => l.type === 'LIKE').length`. Para datasets grandes, adicionar `_count` em queries Prisma.

### Sobre SSL corporativo (NODE_TLS_REJECT_UNAUTHORIZED)
Se `npm install` falhar com certificado, usar: `$env:NODE_TLS_REJECT_UNAUTHORIZED = "0"; npm install ...`
