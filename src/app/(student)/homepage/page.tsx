import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Progress } from '@/components/ui/progress'

export default async function Homepage() {
  const session = await auth()
  if (!session) redirect('/login')

  const courseList = await prisma.course.findMany({
    where: { status: 'PUBLISHED' },
    include: {
      modules: {
        include: {
          lessons: {
            include: { progress: { where: { userId: session.user.id } } },
          },
        },
      },
    },
    orderBy: { order: 'asc' },
  })

  const lastProgress = await prisma.lessonProgress.findFirst({
    where: { userId: session.user.id },
    orderBy: { updatedAt: 'desc' },
    include: {
      lesson: {
        include: { module: { include: { course: true } } },
      },
    },
  })
  const heroCourse = lastProgress?.lesson.module.course ?? courseList[0] ?? null

  return (
    <div className="bg-[#141414] min-h-screen">
      {heroCourse && (
        <div className="relative overflow-hidden">
          {heroCourse.banner && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={heroCourse.banner}
              alt=""
              aria-hidden
              className="absolute inset-0 w-full h-full object-cover opacity-20"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-[#141414]/60 via-[#141414]/80 to-[#141414]" />
          <div className="relative flex items-end pb-10 px-6" style={{ minHeight: '220px' }}>
            <div className="mx-auto max-w-[1280px] w-full">
              <p className="text-xs text-brand font-semibold uppercase tracking-widest mb-2">
                {lastProgress ? 'Continue assistindo' : 'Comece por aqui'}
              </p>
              <h1 className="text-3xl font-bold text-white mb-3">{heroCourse.name}</h1>
              {heroCourse.description && (
                <p className="text-gray-400 text-sm max-w-lg line-clamp-2 mb-4">
                  {heroCourse.description}
                </p>
              )}
              <Link
                href={`/curso/${heroCourse.slug}`}
                className="inline-flex items-center gap-2 bg-brand hover:bg-brand-dark text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
              >
                ▶ {lastProgress ? 'Continuar' : 'Começar'}
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-[1280px] px-6 pb-12">
        {!heroCourse && <div className="h-6" />}
        <h2 className="text-lg font-semibold text-white mb-5">Cursos</h2>

        {courseList.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center rounded-xl border border-[#2a2a2a]">
            <p className="text-gray-500 text-sm">Nenhum curso disponível ainda.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {courseList.map((course) => {
              const allLessons = course.modules.flatMap((m) => m.lessons)
              const completedCount = allLessons.filter((l) =>
                l.progress.some((p) => p.completed)
              ).length
              const total = allLessons.length
              const percent = total > 0 ? Math.round((completedCount / total) * 100) : 0

              return (
                <Link
                  key={course.id}
                  href={`/curso/${course.slug}`}
                  aria-label={`${course.name} — ${percent === 100 ? 'Concluído' : percent > 0 ? `${percent}% concluído` : 'Novo'}`}
                  className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-xl"
                >
                  <div className="relative overflow-hidden rounded-xl bg-[#1f1f1f] border border-[#2a2a2a] transition-all duration-200 group-hover:scale-[1.02] group-hover:border-[#3a3a3a] group-hover:shadow-xl group-hover:shadow-black/40">
                    {course.banner ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={course.banner} alt={course.name} className="w-full h-36 object-cover" />
                    ) : (
                      <div className="w-full h-36 bg-gradient-to-br from-[#2a1a25] to-[#1a1a2a] flex items-center justify-center">
                        <svg viewBox="0 0 24 24" className="w-10 h-10 text-brand/30" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/>
                          <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
                        </svg>
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        percent === 100
                          ? 'bg-green-500/20 text-green-400'
                          : percent > 0
                          ? 'bg-brand-muted text-brand'
                          : 'bg-white/10 text-gray-300'
                      }`}>
                        {percent === 100 ? '✓ Concluído' : percent > 0 ? `${percent}%` : 'Novo'}
                      </span>
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-semibold text-white leading-snug mb-3 line-clamp-2">
                        {course.name}
                      </h3>
                      <div
                        role="progressbar"
                        aria-valuenow={percent}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`Progresso: ${percent}%`}
                      >
                        <Progress value={percent} className="h-1 bg-[#333]" />
                      </div>
                      <p className="mt-2 text-xs text-gray-500">
                        {completedCount}/{total} aulas
                      </p>
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
