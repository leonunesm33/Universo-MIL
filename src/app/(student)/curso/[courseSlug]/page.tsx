import { auth } from '@/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function CoursePage({
  params,
}: {
  params: Promise<{ courseSlug: string }>
}) {
  const { courseSlug } = await params
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

  const allLessons = course.modules.flatMap((m) => m.lessons)
  const completed = allLessons.filter((l) => l.progress.some((p) => p.completed)).length
  const total = allLessons.length
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-8">
      {/* Course header */}
      <div className="mb-8">
        <Link href="/homepage" className="text-sm text-gray-500 hover:text-gray-300 transition-colors mb-4 inline-flex items-center gap-1">
          ← Voltar
        </Link>
        <h1 className="text-2xl font-bold text-white mt-2 mb-2">{course.name}</h1>
        {course.description && (
          <p className="text-gray-400 text-sm mb-4 max-w-2xl">{course.description}</p>
        )}
        <div className="flex items-center gap-4">
          <div className="flex-1 max-w-xs">
            <div className="h-1.5 bg-[#2a2a2a] rounded-full overflow-hidden">
              <div
                className="h-full bg-brand rounded-full transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
          <span className="text-sm text-gray-400">{completed}/{total} aulas</span>
          <span className="text-sm font-semibold text-brand">{percent}%</span>
        </div>
      </div>

      {/* Modules */}
      <div className="space-y-6">
        {course.modules.map((module, moduleIndex) => (
          <div key={module.id}>
            <div className="flex items-center gap-3 mb-3">
              <span className="w-6 h-6 rounded-full bg-[#2a2a2a] flex items-center justify-center text-xs font-bold text-gray-400 shrink-0">
                {moduleIndex + 1}
              </span>
              <h2 className="text-sm font-semibold text-gray-200 uppercase tracking-wide">
                {module.title}
              </h2>
              <span className="text-xs text-gray-600 ml-auto">{module.lessons.length} aulas</span>
            </div>

            <div className="rounded-xl overflow-hidden border border-[#2a2a2a] divide-y divide-[#2a2a2a]">
              {module.lessons.map((lesson) => {
                const done = lesson.progress.some((p) => p.completed)
                return (
                  <Link
                    key={lesson.id}
                    href={`/curso/${courseSlug}/${lesson.slug}/${lesson.id}`}
                    className="flex items-center gap-4 px-5 py-3.5 bg-[#1a1a1a] hover:bg-[#222] transition-colors group"
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-sm ${
                      done ? 'bg-green-500/15 text-green-400' : 'bg-[#2a2a2a] text-gray-500 group-hover:text-brand group-hover:bg-brand-muted'
                    }`}>
                      {done ? '✓' : '▶'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={`text-sm ${done ? 'text-gray-500' : 'text-gray-200 group-hover:text-white'} transition-colors truncate block`}>
                        {lesson.title}
                      </span>
                    </div>
                    {lesson.durationSecs && (
                      <span className="text-xs text-gray-600 shrink-0">
                        {Math.floor(lesson.durationSecs / 60)}:{String(lesson.durationSecs % 60).padStart(2, '0')}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
