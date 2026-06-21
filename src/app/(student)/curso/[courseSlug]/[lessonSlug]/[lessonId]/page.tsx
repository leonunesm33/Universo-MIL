import { auth } from '@/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { extractVideoId } from '@/lib/youtube'
import Link from 'next/link'
import { LessonVideoSection } from '@/components/student/LessonVideoSection'

export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseSlug: string; lessonSlug: string; lessonId: string }>
}) {
  const { courseSlug, lessonId } = await params
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
                include: { lessons: { orderBy: { order: 'asc' } } },
              },
            },
          },
          lessons: { orderBy: { order: 'asc' }, select: { id: true } },
          assessments: { where: { status: 'ACTIVE' }, select: { id: true, title: true } },
        },
      },
      progress: { where: { userId: session.user.id } },
      likes: true,
      favorites: { where: { userId: session.user.id } },
    },
  })

  if (!lesson) notFound()

  const userProgressInCourse = await prisma.lessonProgress.findMany({
    where: {
      userId: session.user.id,
      completed: true,
      lesson: { module: { courseId: lesson.module.courseId } },
    },
    select: { lessonId: true },
  })
  const completedLessonIds = new Set(userProgressInCourse.map((p) => p.lessonId))

  // Check module completion for assessment trigger
  const moduleLessonIds = lesson.module.lessons.map((l) => l.id)
  const completedInModule = await prisma.lessonProgress.count({
    where: { userId: session.user.id, lessonId: { in: moduleLessonIds }, completed: true },
  })
  const moduleComplete = completedInModule >= moduleLessonIds.length
  const moduleAssessment = moduleComplete && lesson.module.assessments.length > 0
    ? lesson.module.assessments[0]
    : null

  const videoId = lesson.youtubeUrl ? extractVideoId(lesson.youtubeUrl) : null
  const userProgress = lesson.progress[0] ?? null
  const userLike = lesson.likes.find((l) => l.userId === session.user.id)
  const likeCount = lesson.likes.filter((l) => l.type === 'LIKE').length
  const dislikeCount = lesson.likes.filter((l) => l.type === 'DISLIKE').length
  const isFavorited = lesson.favorites.length > 0
  const isCompleted = userProgress?.completed ?? false

  // Build flat list of all lessons for prev/next navigation
  const allLessons = lesson.module.course.modules.flatMap((m) =>
    m.lessons.map((l) => ({ ...l, moduleSlug: m.slug }))
  )
  const currentIndex = allLessons.findIndex((l) => l.id === lessonId)
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null

  // Find next module
  const currentModuleIndex = lesson.module.course.modules.findIndex(
    (m) => m.id === lesson.module.id
  )
  const nextModule = lesson.module.course.modules[currentModuleIndex + 1] ?? null
  const nextModuleFirstLesson = nextModule?.lessons[0] ?? null

  return (
    <div className="bg-[#141414] min-h-screen">
      <div className="mx-auto max-w-[1280px] px-4 py-4">
        {/* Back link */}
        <Link
          href={`/curso/${courseSlug}`}
          className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors mb-4"
        >
          <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 fill-current">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
          </svg>
          Voltar para {lesson.module.course.name}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">
          {/* Main: player + controls + info */}
          <div>
            <LessonVideoSection
              videoId={videoId}
              lessonId={lesson.id}
              durationSecs={lesson.durationSecs ?? 0}
              initialWatchedSecs={userProgress?.watchedSecs ?? 0}
              initialCompleted={isCompleted}
              prevHref={prevLesson ? `/curso/${courseSlug}/${prevLesson.slug}/${prevLesson.id}` : null}
              nextHref={nextLesson ? `/curso/${courseSlug}/${nextLesson.slug}/${nextLesson.id}` : null}
              initialLike={userLike?.type ?? null}
              likeCount={likeCount}
              dislikeCount={dislikeCount}
              isFavorited={isFavorited}
            />

            {/* Lesson info */}
            <div className="mt-4 pb-6">
              <h1 className="text-lg font-bold text-white mb-1">{lesson.title}</h1>
              <p className="text-sm text-gray-500">{lesson.module.title} · {lesson.module.course.name}</p>

              {lesson.description && (
                <div className="mt-4 p-4 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a]">
                  <p className="text-sm text-gray-300 leading-relaxed">{lesson.description}</p>
                </div>
              )}

              {lesson.documentUrl && (
                <div className="mt-4">
                  <a
                    href={lesson.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                    Abrir documento
                  </a>
                </div>
              )}

              {moduleAssessment && (
                <div className="mt-6 bg-brand/10 border border-brand/30 rounded-xl p-5">
                  <h3 className="text-white font-semibold mb-2">🎓 Módulo concluído!</h3>
                  <p className="text-gray-300 text-sm mb-4">
                    Agora faça a avaliação para conquistar seu certificado.
                  </p>
                  <a
                    href={`/avaliacao/${moduleAssessment.id}`}
                    className="inline-block bg-brand hover:bg-brand/90 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors"
                  >
                    Iniciar Avaliação
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar: lesson list */}
          <div className="lg:sticky lg:top-20 lg:max-h-[calc(100vh-5.5rem)] overflow-y-auto">
            <div className="rounded-xl bg-[#0f0f0f] border border-[#1e1e1e] overflow-hidden flex flex-col">
              {/* Sidebar header */}
              <div className="px-4 py-3 border-b border-[#1e1e1e]">
                <p className="text-sm font-semibold text-white line-clamp-1">
                  {lesson.module.course.name}
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  Aulas · {allLessons.length} Conteúdos
                </p>
              </div>

              {/* Lesson list */}
              <div className="flex-1 divide-y divide-[#1e1e1e]">
                {lesson.module.course.modules.map((mod) => (
                  <div key={mod.id}>
                    <div className="px-4 py-2 bg-[#0a0a0a]">
                      <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                        {mod.title}
                      </p>
                    </div>
                    {mod.lessons.map((l) => {
                      const isActive = l.id === lessonId
                      return (
                        <Link
                          key={l.id}
                          href={`/curso/${courseSlug}/${l.slug}/${l.id}`}
                          className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${
                            isActive
                              ? 'bg-brand/8 border-l-2 border-brand'
                              : 'hover:bg-[#1a1a1a] border-l-2 border-transparent'
                          }`}
                        >
                          <span className={`text-xs shrink-0 ${isActive ? 'text-brand' : completedLessonIds.has(l.id) ? 'text-emerald-500' : 'text-gray-700'}`}>
                            {isActive ? '▶' : completedLessonIds.has(l.id) ? '✓' : '◦'}
                          </span>
                          <span
                            className={`text-xs line-clamp-2 leading-snug ${
                              isActive ? 'text-white font-medium' : completedLessonIds.has(l.id) ? 'text-gray-400' : 'text-gray-500'
                            }`}
                          >
                            {l.title}
                          </span>
                        </Link>
                      )
                    })}
                  </div>
                ))}
              </div>

              {/* "Ir para o próximo módulo" — only if next module exists */}
              {nextModuleFirstLesson && nextModule && (
                <div className="p-3 border-t border-[#1e1e1e]">
                  <Link
                    href={`/curso/${courseSlug}/${nextModuleFirstLesson.slug}/${nextModuleFirstLesson.id}`}
                    className="flex items-center justify-center gap-2 w-full bg-brand hover:bg-brand-dark text-white text-xs font-semibold py-2.5 rounded-lg transition-colors"
                  >
                    <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 fill-current">
                      <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M6 5l4 3-4 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                    </svg>
                    Ir para o próximo módulo
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
