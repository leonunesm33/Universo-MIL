# Plano Fase 1 — Foundation: Projeto, DB e Auth

## Contexto do projeto

Clone da plataforma The Members (Netflix de treinamentos internos). Stack: Next.js 14 App Router + TypeScript + Tailwind + shadcn/ui + PostgreSQL + Prisma v7 + NextAuth.js v5 (next-auth@beta).

**Single-tenant** — sem org isolation, sem `orgId` em nenhuma tabela.  
**Dois "apps" no mesmo repo**: portal do colaborador (`/`) e admin dashboard (`/admin/*`).  
**Diretório**: `d:\Projetos\Learn_plataform`

---

## APIs Confirmadas (Phase 0 — Documentation Discovery)

### Next.js 14 + create-next-app
- Comando: `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"`
- Cria estrutura com `src/app/`, alias `@/*` → `./src/*`

### NextAuth.js v5 (next-auth@beta)
- Pacote: `npm install next-auth@beta`
- Config principal em `/auth.ts` (raiz do projeto, FORA de `src/`)
- Exports: `export const { handlers, signIn, signOut, auth } = NextAuth({...})`
- Route handler: `src/app/api/auth/[...nextauth]/route.ts` → `export const { GET, POST } = handlers`
- Session em Server Components: `const session = await auth()` (substitui `getServerSession`)
- Env vars: `AUTH_SECRET`, `AUTH_URL`
- Type extension: declarar `declare module "next-auth"` em `src/types/next-auth.d.ts`
- **Client Components**: importar `signIn` de `next-auth/react` (não de `@/auth`)
- **Server Actions**: importar `signIn` de `@/auth`

### Prisma v7
- Pacote: `npm install prisma @prisma/client`
- Init: `npx prisma init --datasource-provider postgresql`
- UUID: `@default(uuid())` (v4)
- Singleton em `src/lib/prisma.ts` (padrão global para evitar múltiplas instâncias em hot-reload)
- Seed: `tsx prisma/seed.ts` via `"prisma": { "seed": "tsx prisma/seed.ts" }` no package.json
- Migration: `npx prisma migrate dev --name init`
- Nunca usar `prisma db push` em produção

### shadcn/ui
- Init: `npx shadcn@latest init` (CLI novo — NÃO usar `shadcn-ui`)
- Componentes em `src/components/ui/`
- `src/lib/utils.ts` criado automaticamente com função `cn()`
- Adicionar: `npx shadcn@latest add button input card form label`

---

## Phase 1 — Criar Projeto Next.js e Instalar Dependências

**Objetivo**: Projeto Next.js rodando com todas as dependências instaladas.

**Diretório**: `d:\Projetos\Learn_plataform`

### Tarefas

1. Criar projeto Next.js (se `package.json` não existir):
   ```bash
   npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-git
   ```
   Se perguntar interativamente: `src/`, App Router, import alias `@/*`, YES para tudo.

2. Instalar dependências de produção:
   ```bash
   npm install next-auth@beta prisma @prisma/client bcryptjs jsonwebtoken
   ```

3. Instalar dependências de desenvolvimento:
   ```bash
   npm install -D @types/bcryptjs @types/jsonwebtoken tsx
   ```

4. Inicializar shadcn/ui:
   ```bash
   npx shadcn@latest init
   ```
   Responder ao wizard: Next.js, Default style, CSS variables = yes, alias `@/*`.

5. Adicionar componentes shadcn necessários para o login placeholder:
   ```bash
   npx shadcn@latest add button input card form label
   ```

### Verificação
- `package.json` contém `next-auth`, `prisma`, `@prisma/client`, `bcryptjs`, `jsonwebtoken`
- `src/components/ui/button.tsx` existe
- `src/lib/utils.ts` existe com função `cn()`

---

## Phase 2 — Schema Prisma e Migration

**Objetivo**: Todas as 14 tabelas migradas no PostgreSQL, seed rodando.

### Pré-requisito
PostgreSQL rodando localmente. Criar banco `learn_platform` e configurar `.env`:
```
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/learn_platform?schema=public"
```

### Tarefas

1. Inicializar Prisma (se `prisma/schema.prisma` não existir):
   ```bash
   npx prisma init --datasource-provider postgresql
   ```

2. Escrever o schema completo em `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  ADMIN
  STUDENT
}

enum CourseStatus {
  DRAFT
  PUBLISHED
}

enum LessonType {
  VIDEO
  ASSESSMENT
}

enum AssessmentType {
  COMMON
  CERT
}

enum AssessmentStatus {
  ACTIVE
  INACTIVE
}

enum LikeType {
  LIKE
  DISLIKE
}

model User {
  id               String    @id @default(uuid())
  name             String
  email            String    @unique
  passwordHash     String?
  cpf              String?   @unique
  phone            String?
  avatar           String?
  role             Role      @default(STUDENT)
  blocked          Boolean   @default(false)
  blockedComments  Boolean   @default(false)
  lastAccessAt     DateTime?
  createdAt        DateTime  @default(now())

  courses          UserCourse[]
  progress         LessonProgress[]
  favorites        Favorite[]
  likes            Like[]
  assessments      AssessmentResponse[]
  notesAboutMe     StudentNote[]  @relation("StudentNotes")
  notesByMe        StudentNote[]  @relation("AdminNotes")
  loginLogs        LoginLog[]
}

model Course {
  id          String        @id @default(uuid())
  name        String
  slug        String        @unique
  banner      String?
  description String?
  status      CourseStatus  @default(DRAFT)
  order       Int           @default(0)
  createdAt   DateTime      @default(now())

  modules     Module[]
  enrollments UserCourse[]
}

model Module {
  id        String   @id @default(uuid())
  courseId  String
  title     String
  slug      String
  thumbnail String?
  order     Int      @default(0)

  course    Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)
  lessons   Lesson[]
}

model Lesson {
  id           String      @id @default(uuid())
  moduleId     String
  title        String
  slug         String
  youtubeUrl   String?
  description  String?
  durationSecs Int?
  thumbnail    String?
  type         LessonType  @default(VIDEO)
  order        Int         @default(0)

  module       Module              @relation(fields: [moduleId], references: [id], onDelete: Cascade)
  progress     LessonProgress[]
  favorites    Favorite[]
  likes        Like[]
  assessments  Assessment[]
}

model UserCourse {
  userId     String
  courseId   String
  enrolledAt DateTime @default(now())

  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  course Course @relation(fields: [courseId], references: [id], onDelete: Cascade)

  @@id([userId, courseId])
}

model LessonProgress {
  id          String    @id @default(uuid())
  userId      String
  lessonId    String
  watchedSecs Int       @default(0)
  completed   Boolean   @default(false)
  completedAt DateTime?
  updatedAt   DateTime  @updatedAt

  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  lesson Lesson @relation(fields: [lessonId], references: [id], onDelete: Cascade)

  @@unique([userId, lessonId])
}

model Assessment {
  id           String           @id @default(uuid())
  lessonId     String
  title        String
  type         AssessmentType   @default(COMMON)
  status       AssessmentStatus @default(ACTIVE)
  passingScore Int?

  lesson    Lesson               @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  questions Question[]
  responses AssessmentResponse[]
}

model Question {
  id           String   @id @default(uuid())
  assessmentId String
  text         String
  type         String   @default("SINGLE")
  order        Int      @default(0)

  assessment Assessment @relation(fields: [assessmentId], references: [id], onDelete: Cascade)
  options    Option[]
}

model Option {
  id         String  @id @default(uuid())
  questionId String
  text       String
  isCorrect  Boolean @default(false)
  order      Int     @default(0)

  question Question @relation(fields: [questionId], references: [id], onDelete: Cascade)
}

model AssessmentResponse {
  id           String   @id @default(uuid())
  userId       String
  assessmentId String
  answers      Json
  score        Int?
  passed       Boolean?
  submittedAt  DateTime @default(now())

  user       User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  assessment Assessment @relation(fields: [assessmentId], references: [id], onDelete: Cascade)
}

model Favorite {
  id        String   @id @default(uuid())
  userId    String
  lessonId  String
  createdAt DateTime @default(now())

  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  lesson Lesson @relation(fields: [lessonId], references: [id], onDelete: Cascade)

  @@unique([userId, lessonId])
}

model Like {
  id       String   @id @default(uuid())
  userId   String
  lessonId String
  type     LikeType

  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  lesson Lesson @relation(fields: [lessonId], references: [id], onDelete: Cascade)

  @@unique([userId, lessonId])
}

model StudentNote {
  id               String   @id @default(uuid())
  adminId          String
  studentId        String
  content          String
  visibleToStudent Boolean  @default(false)
  updatedAt        DateTime @updatedAt

  admin   User @relation("AdminNotes", fields: [adminId], references: [id])
  student User @relation("StudentNotes", fields: [studentId], references: [id])
}

model LoginLog {
  id        String   @id @default(uuid())
  userId    String
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

3. Rodar migration:
   ```bash
   npx prisma migrate dev --name init
   ```

4. Criar `src/lib/prisma.ts` (singleton):
   ```typescript
   import { PrismaClient } from '@prisma/client'

   const globalForPrisma = global as unknown as { prisma: PrismaClient }

   export const prisma =
     globalForPrisma.prisma ||
     new PrismaClient({
       log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
     })

   if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
   ```

5. Criar `prisma/seed.ts`:
   ```typescript
   import { PrismaClient } from '@prisma/client'
   import bcrypt from 'bcryptjs'

   const prisma = new PrismaClient()

   async function main() {
     console.log('🌱 Iniciando seed...')

     // Limpar dados existentes (ordem importa por foreign keys)
     await prisma.loginLog.deleteMany()
     await prisma.studentNote.deleteMany()
     await prisma.assessmentResponse.deleteMany()
     await prisma.option.deleteMany()
     await prisma.question.deleteMany()
     await prisma.assessment.deleteMany()
     await prisma.lessonProgress.deleteMany()
     await prisma.favorite.deleteMany()
     await prisma.like.deleteMany()
     await prisma.lesson.deleteMany()
     await prisma.module.deleteMany()
     await prisma.userCourse.deleteMany()
     await prisma.course.deleteMany()
     await prisma.user.deleteMany()

     // Admin
     const adminPassword = await bcrypt.hash('admin123', 10)
     const admin = await prisma.user.create({
       data: {
         name: 'Admin',
         email: 'admin@plataforma.com',
         passwordHash: adminPassword,
         role: 'ADMIN',
       },
     })
     console.log('✅ Admin criado:', admin.email)

     // Aluna de teste
     const studentPassword = await bcrypt.hash('teste123', 10)
     const student = await prisma.user.create({
       data: {
         name: 'Colaboradora Teste',
         email: 'teste@plataforma.com',
         passwordHash: studentPassword,
         cpf: '12345678901',
         role: 'STUDENT',
       },
     })
     console.log('✅ Aluna criada:', student.email)

     // Curso de boas-vindas
     const course = await prisma.course.create({
       data: {
         name: 'Módulo de Boas-Vindas',
         slug: 'modulo-boas-vindas',
         description: 'Bem-vinda à equipe! Este módulo vai te orientar sobre tudo que você precisa saber.',
         status: 'PUBLISHED',
         order: 0,
       },
     })
     console.log('✅ Curso criado:', course.name)

     // Módulo 1
     const module1 = await prisma.module.create({
       data: {
         courseId: course.id,
         title: 'Módulo 1 - Introdução',
         slug: 'modulo-1-introducao',
         order: 0,
       },
     })

     // Aulas do módulo 1
     await prisma.lesson.createMany({
       data: [
         {
           moduleId: module1.id,
           title: '1.1 - Bem-vinda à equipe',
           slug: '11-bem-vinda-equipe',
           youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
           durationSecs: 105,
           type: 'VIDEO',
           order: 0,
         },
         {
           moduleId: module1.id,
           title: '1.2 - Nossa história',
           slug: '12-nossa-historia',
           youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
           durationSecs: 210,
           type: 'VIDEO',
           order: 1,
         },
         {
           moduleId: module1.id,
           title: '1.3 - Missão, Visão e Valores',
           slug: '13-missao-visao-valores',
           youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
           durationSecs: 180,
           type: 'VIDEO',
           order: 2,
         },
       ],
     })
     console.log('✅ Módulo 1 com 3 aulas criado')

     // Módulo 2
     const module2 = await prisma.module.create({
       data: {
         courseId: course.id,
         title: 'Módulo 2 - Código de Cultura',
         slug: 'modulo-2-codigo-cultura',
         order: 1,
       },
     })

     // Aulas do módulo 2
     await prisma.lesson.createMany({
       data: [
         {
           moduleId: module2.id,
           title: '2.1 - Nossos valores',
           slug: '21-nossos-valores',
           youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
           durationSecs: 150,
           type: 'VIDEO',
           order: 0,
         },
         {
           moduleId: module2.id,
           title: '2.2 - Como trabalhamos',
           slug: '22-como-trabalhamos',
           youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
           durationSecs: 200,
           type: 'VIDEO',
           order: 1,
         },
         {
           moduleId: module2.id,
           title: '2.3 - Políticas internas',
           slug: '23-politicas-internas',
           youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
           durationSecs: 240,
           type: 'VIDEO',
           order: 2,
         },
       ],
     })
     console.log('✅ Módulo 2 com 3 aulas criado')

     // Matricular aluna no curso
     await prisma.userCourse.create({
       data: {
         userId: student.id,
         courseId: course.id,
       },
     })
     console.log('✅ Aluna matriculada no curso')

     console.log('\n🎉 Seed concluído!')
     console.log('   Admin: admin@plataforma.com / admin123')
     console.log('   Aluna: teste@plataforma.com / teste123')
   }

   main()
     .then(async () => { await prisma.$disconnect() })
     .catch(async (e) => {
       console.error(e)
       await prisma.$disconnect()
       process.exit(1)
     })
   ```

6. Adicionar seed ao `package.json`:
   ```json
   "prisma": {
     "seed": "tsx prisma/seed.ts"
   }
   ```

7. Rodar seed:
   ```bash
   npx prisma db seed
   ```

### Verificação
- `npx prisma migrate dev --name init` conclui sem erros
- `npx prisma db seed` imprime "🎉 Seed concluído!"
- `npx prisma studio` mostra tabelas populadas (opcional)

---

## Phase 3 — NextAuth v5: Config, Providers, Types

**Objetivo**: Login funcional com email/senha, CPF e magic link (sem Resend — log no console).

### Tarefas

1. Criar `.env.local` na raiz (além de `.env` do Prisma — ou consolidar tudo em `.env`):
   ```
   AUTH_SECRET="gerar-com-openssl-rand-base64-32"
   AUTH_URL="http://localhost:3000"
   DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/learn_platform?schema=public"
   JWT_SECRET="outro-secret-para-magic-link"
   ```
   Gerar AUTH_SECRET: `openssl rand -base64 32` ou `npx auth secret`

2. Criar `src/types/next-auth.d.ts`:
   ```typescript
   import { DefaultSession } from 'next-auth'

   declare module 'next-auth' {
     interface Session {
       user: {
         id: string
         role: 'ADMIN' | 'STUDENT'
       } & DefaultSession['user']
     }

     interface User {
       id: string
       role: 'ADMIN' | 'STUDENT'
     }
   }

   declare module 'next-auth/jwt' {
     interface JWT {
       id: string
       role: 'ADMIN' | 'STUDENT'
     }
   }
   ```

3. Criar `/auth.ts` (na RAIZ do projeto, fora de `src/`):
   ```typescript
   import NextAuth from 'next-auth'
   import Credentials from 'next-auth/providers/credentials'
   import bcrypt from 'bcryptjs'
   import { prisma } from '@/lib/prisma'

   export const { handlers, signIn, signOut, auth } = NextAuth({
     providers: [
       // Provider 1: email + senha
       Credentials({
         id: 'credentials',
         name: 'Email e Senha',
         credentials: {
           email: { label: 'Email', type: 'email' },
           password: { label: 'Senha', type: 'password' },
         },
         async authorize(credentials) {
           if (!credentials?.email || !credentials?.password) return null

           const user = await prisma.user.findUnique({
             where: { email: credentials.email as string },
           })

           if (!user || !user.passwordHash) return null
           if (user.blocked) return null

           const valid = await bcrypt.compare(
             credentials.password as string,
             user.passwordHash
           )
           if (!valid) return null

           // Registrar login
           await prisma.loginLog.create({ data: { userId: user.id } })
           await prisma.user.update({
             where: { id: user.id },
             data: { lastAccessAt: new Date() },
           })

           return { id: user.id, name: user.name, email: user.email, role: user.role }
         },
       }),

       // Provider 2: CPF
       Credentials({
         id: 'cpf',
         name: 'CPF',
         credentials: {
           cpf: { label: 'CPF', type: 'text' },
           password: { label: 'Senha', type: 'password' },
         },
         async authorize(credentials) {
           if (!credentials?.cpf || !credentials?.password) return null

           const cpf = (credentials.cpf as string).replace(/\D/g, '')
           const user = await prisma.user.findUnique({ where: { cpf } })

           if (!user || !user.passwordHash) return null
           if (user.blocked) return null

           const valid = await bcrypt.compare(
             credentials.password as string,
             user.passwordHash
           )
           if (!valid) return null

           await prisma.loginLog.create({ data: { userId: user.id } })
           await prisma.user.update({
             where: { id: user.id },
             data: { lastAccessAt: new Date() },
           })

           return { id: user.id, name: user.name, email: user.email, role: user.role }
         },
       }),
     ],

     callbacks: {
       jwt({ token, user }) {
         if (user) {
           token.id = user.id
           token.role = user.role as 'ADMIN' | 'STUDENT'
         }
         return token
       },
       session({ session, token }) {
         if (session.user) {
           session.user.id = token.id
           session.user.role = token.role
         }
         return session
       },
     },

     pages: {
       signIn: '/login',
     },
   })
   ```

4. Criar `src/app/api/auth/[...nextauth]/route.ts`:
   ```typescript
   import { handlers } from '@/auth'
   export const { GET, POST } = handlers
   ```
   
   **Atenção**: como `auth.ts` está na raiz e `src/` usa alias `@/*` → `./src/*`, importar assim:
   ```typescript
   // Ajuste do alias se necessário: auth.ts está na raiz
   // Verificar tsconfig.json — se @/* aponta para ./src, criar reexport
   ```
   
   Alternativa segura: mover `auth.ts` para `src/auth.ts` e atualizar imports.

5. Criar rota de magic link `src/app/api/auth/magic-link/route.ts`:
   ```typescript
   import { NextRequest, NextResponse } from 'next/server'
   import jwt from 'jsonwebtoken'
   import { prisma } from '@/lib/prisma'
   import { signIn } from '@/auth'

   const JWT_SECRET = process.env.JWT_SECRET!

   // POST: gera token e loga no console (sem email por enquanto)
   export async function POST(request: NextRequest) {
     const { email } = await request.json()
     if (!email) return NextResponse.json({ error: 'Email obrigatório' }, { status: 400 })

     const user = await prisma.user.findUnique({ where: { email } })
     if (!user) {
       // Não revelar se o email existe ou não
       return NextResponse.json({ message: 'Se o email existir, você receberá o link.' })
     }

     const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '15m' })
     const link = `${process.env.AUTH_URL}/api/auth/magic-link?token=${token}`

     // Por ora: log no console (substituir por Resend na Fase 4)
     console.log(`\n🔗 Magic Link para ${email}:\n${link}\n`)

     return NextResponse.json({ message: 'Link gerado (verifique o console do servidor).' })
   }

   // GET: valida token e faz redirect
   export async function GET(request: NextRequest) {
     const token = request.nextUrl.searchParams.get('token')
     if (!token) return NextResponse.redirect(new URL('/login?error=token_missing', request.url))

     try {
       const payload = jwt.verify(token, JWT_SECRET) as { userId: string }
       const user = await prisma.user.findUnique({ where: { id: payload.userId } })
       if (!user) throw new Error('Usuário não encontrado')

       // Redirecionar para login com flag especial — o login page faz signIn via action
       const params = new URLSearchParams({ magic: user.email })
       return NextResponse.redirect(new URL(`/login?${params}`, request.url))
     } catch {
       return NextResponse.redirect(new URL('/login?error=token_invalid', request.url))
     }
   }
   ```

6. Criar `src/app/login/page.tsx` (placeholder funcional com formulário básico):
   ```typescript
   'use client'

   import { useState } from 'react'
   import { signIn } from 'next-auth/react'
   import { useRouter, useSearchParams } from 'next/navigation'
   import { Button } from '@/components/ui/button'
   import { Input } from '@/components/ui/input'
   import { Label } from '@/components/ui/label'
   import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

   export default function LoginPage() {
     const router = useRouter()
     const searchParams = useSearchParams()
     const [email, setEmail] = useState('')
     const [password, setPassword] = useState('')
     const [error, setError] = useState('')
     const [loading, setLoading] = useState(false)

     async function handleSubmit(e: React.FormEvent) {
       e.preventDefault()
       setLoading(true)
       setError('')

       const result = await signIn('credentials', {
         email,
         password,
         redirect: false,
       })

       setLoading(false)

       if (result?.error) {
         setError('Email ou senha incorretos.')
       } else {
         router.push('/homepage')
       }
     }

     return (
       <div className="min-h-screen flex items-center justify-center bg-gray-950">
         <Card className="w-full max-w-md">
           <CardHeader>
             <CardTitle>Entrar na plataforma</CardTitle>
           </CardHeader>
           <CardContent>
             <form onSubmit={handleSubmit} className="space-y-4">
               <div>
                 <Label htmlFor="email">Email</Label>
                 <Input
                   id="email"
                   type="email"
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   placeholder="seu@email.com"
                   required
                 />
               </div>
               <div>
                 <Label htmlFor="password">Senha</Label>
                 <Input
                   id="password"
                   type="password"
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   placeholder="••••••••"
                   required
                 />
               </div>
               {error && <p className="text-red-500 text-sm">{error}</p>}
               <Button type="submit" className="w-full" disabled={loading}>
                 {loading ? 'Entrando...' : 'Entrar'}
               </Button>
             </form>
           </CardContent>
         </Card>
       </div>
     )
   }
   ```

7. Criar `src/app/homepage/page.tsx` (placeholder de rota autenticada):
   ```typescript
   import { auth } from '@/auth'
   import { redirect } from 'next/navigation'

   export default async function Homepage() {
     const session = await auth()
     if (!session) redirect('/login')

     return (
       <div className="p-8">
         <h1 className="text-2xl font-bold">Homepage</h1>
         <p>Bem-vinda, {session.user.name}! (Role: {session.user.role})</p>
       </div>
     )
   }
   ```

8. Criar `src/app/admin/dashboard/page.tsx` (placeholder admin):
   ```typescript
   import { auth } from '@/auth'
   import { redirect } from 'next/navigation'

   export default async function AdminDashboard() {
     const session = await auth()
     if (!session || session.user.role !== 'ADMIN') redirect('/login')

     return (
       <div className="p-8">
         <h1 className="text-2xl font-bold">Admin Dashboard</h1>
         <p>Olá, {session.user.name}!</p>
       </div>
     )
   }
   ```

### Verificação
- Arquivo `/auth.ts` (ou `src/auth.ts`) existe com exports corretos
- `src/app/api/auth/[...nextauth]/route.ts` existe
- `src/app/login/page.tsx` existe
- `src/app/homepage/page.tsx` existe

---

## Phase 4 — Middleware de Rotas

**Objetivo**: Separação entre rotas públicas, protegidas (student) e admin.

### Tarefas

1. Criar `src/middleware.ts`:
   ```typescript
   import { auth } from '@/auth'
   import { NextRequest, NextResponse } from 'next/server'

   export async function middleware(request: NextRequest) {
     const session = await auth()
     const { pathname } = request.nextUrl

     // Rotas públicas — sempre acessíveis
     const publicRoutes = ['/login', '/api/auth']
     if (publicRoutes.some((r) => pathname.startsWith(r))) {
       return NextResponse.next()
     }

     // Raiz — redireciona para homepage se autenticado
     if (pathname === '/') {
       if (session) return NextResponse.redirect(new URL('/homepage', request.url))
       return NextResponse.redirect(new URL('/login', request.url))
     }

     // Sem sessão — redireciona para login
     if (!session) {
       return NextResponse.redirect(new URL('/login', request.url))
     }

     // Rotas admin — exige ADMIN
     if (pathname.startsWith('/admin')) {
       if (session.user.role !== 'ADMIN') {
         return NextResponse.redirect(new URL('/homepage', request.url))
       }
     }

     return NextResponse.next()
   }

   export const config = {
     matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)'],
   }
   ```

   **Atenção**: Se `auth.ts` estiver na raiz e `middleware.ts` estiver em `src/`, o import `@/auth` pode não resolver. Neste caso, colocar `middleware.ts` também na raiz (Next.js aceita `middleware.ts` na raiz ou em `src/`).

### Verificação
- `src/middleware.ts` (ou `middleware.ts` na raiz) existe
- Acessar `/admin` sem auth deve redirecionar para `/login`

---

## Phase 5 — Verificação Final

**Objetivo**: Provar que tudo funciona end-to-end.

### Checklist de Verificação

1. **Compilação limpa**:
   ```bash
   npm run build
   ```
   Deve concluir sem erros TypeScript.

2. **Servidor em desenvolvimento**:
   ```bash
   npm run dev
   ```
   Deve subir sem erros em `http://localhost:3000`.

3. **Middleware funciona**:
   - Abrir `http://localhost:3000/` → deve redirecionar para `/login`
   - Abrir `http://localhost:3000/admin/dashboard` sem login → deve redirecionar para `/login`

4. **Login funciona**:
   - Acessar `http://localhost:3000/login`
   - Login com `teste@plataforma.com` / `teste123` → redireciona para `/homepage`
   - Login com `admin@plataforma.com` / `admin123` → redireciona para `/homepage` (role STUDENT vai para homepage, ADMIN também vai — veremos a separação na Fase 3 do projeto)

5. **Seed verificado**:
   ```bash
   npx prisma studio
   ```
   Confirmar: 2 users, 1 curso, 2 módulos, 6 aulas, 1 userCourse.

6. **TypeScript sem erros**:
   ```bash
   npx tsc --noEmit
   ```

---

## Notas Importantes para o Executor

### Sobre o `auth.ts` na raiz vs `src/`
O NextAuth v5 doc mostra `/auth.ts` na raiz do projeto. Mas com `src/` e alias `@/*` → `./src/*`, o import `import { auth } from '@/auth'` buscará `src/auth.ts`. **Solução recomendada**: colocar `auth.ts` em `src/auth.ts` para que o alias funcione naturalmente. O route handler em `src/app/api/auth/[...nextauth]/route.ts` importará normalmente.

### Sobre variáveis de ambiente
- `.env` — usado pelo Prisma CLI (DATABASE_URL)
- `.env.local` — usado pelo Next.js runtime (AUTH_SECRET, AUTH_URL, JWT_SECRET, DATABASE_URL)
- Consolidar tudo em `.env.local` é mais simples para desenvolvimento local

### Sobre `middleware.ts` no Next.js App Router
- Deve ficar em `src/middleware.ts` (quando usando `src/`) ou na raiz
- O `auth()` dentro do middleware faz uma chamada de verificação de JWT — é rápido e não acessa o DB

### Banco de dados local
Se não tiver PostgreSQL local, use Docker:
```bash
docker run --name learn-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=learn_platform -p 5432:5432 -d postgres
```
DATABASE_URL: `postgresql://postgres:postgres@localhost:5432/learn_platform?schema=public`
