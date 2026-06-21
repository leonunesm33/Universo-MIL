import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

interface Props { params: Promise<{ userId: string }> }

export async function generateMetadata({ params }: Props) {
  const { userId } = await params
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } })
  return { title: user?.name ?? 'Colaborador' }
}

export default async function EquipeMemberPage({ params }: Props) {
  await auth()

  const { userId } = await params
  const member = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      progress: {
        where: { completed: true },
        include: {
          lesson: {
            include: {
              module: { include: { course: { select: { name: true, slug: true } } } },
            },
          },
        },
        orderBy: { completedAt: 'desc' },
        take: 10,
      },
      courses: {
        include: { course: true },
      },
    },
  })

  if (!member || member.blocked) notFound()

  const roleLabel: Record<string, string> = {
    COLABORADOR: 'Colaboradora',
    SUPERVISAO: 'Supervisão',
    GERENTE: 'Gerente',
    GESTAO: 'Gestão',
  }

  function initials(name: string) {
    return name.split(' ').filter(Boolean).map((n) => n[0]).slice(0, 2).join('').toUpperCase() || '?'
  }

  const completedCount = member.progress.length
  const coursesEnrolled = member.courses.length

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Link
        href="/equipe"
        className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors mb-6"
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Voltar à equipe
      </Link>

      <div className="flex items-center gap-5 mb-8">
        {member.avatar ? (
          <Image
            src={member.avatar}
            alt={member.name}
            width={72}
            height={72}
            className="w-18 h-18 rounded-full object-cover"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-[var(--brand)]/20 flex items-center justify-center text-[var(--brand)] font-bold text-xl shrink-0">
            {initials(member.name)}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-white">{member.name}</h1>
          <p className="text-white/50 text-sm">{member.email}</p>
          <span className="inline-block mt-1 text-xs font-medium text-white/50 bg-white/10 px-2 py-0.5 rounded">
            {roleLabel[member.role] ?? member.role}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <p className="text-white/50 text-sm">Aulas Concluídas</p>
          <p className="text-3xl font-bold text-white mt-1">{completedCount}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <p className="text-white/50 text-sm">Trilhas Matriculadas</p>
          <p className="text-3xl font-bold text-white mt-1">{coursesEnrolled}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <p className="text-white/50 text-sm">Último Acesso</p>
          <p className="text-sm font-semibold text-white mt-1">
            {member.lastAccessAt
              ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(new Date(member.lastAccessAt))
              : '—'}
          </p>
        </div>
      </div>

      {member.progress.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white/40 mb-3">Últimas Aulas Concluídas</h2>
          <div className="divide-y divide-white/8 rounded-xl overflow-hidden border border-white/10 bg-white/5">
            {member.progress.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-4 py-3">
                <div className="min-w-0">
                  <p className="text-white text-sm font-medium truncate">{p.lesson.title}</p>
                  <p className="text-white/40 text-xs">{p.lesson.module.course.name}</p>
                </div>
                {p.completedAt && (
                  <span className="text-white/30 text-xs shrink-0 ml-4">
                    {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(new Date(p.completedAt))}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
