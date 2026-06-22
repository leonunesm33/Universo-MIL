import { prisma } from '@/lib/prisma'
import { Pagination } from '@/components/admin/Pagination'
import { StoreFilter } from '@/components/admin/StoreFilter'

const PAGE_SIZE = 10

export default async function RelatoriosPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; storeId?: string }>
}) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1)
  const storeId = params.storeId

  const [totalCourses, courses, stores] = await Promise.all([
    prisma.course.count({ where: { status: 'PUBLISHED' } }),
    prisma.course.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { name: 'asc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        enrollments: {
          where: storeId ? { user: { storeId } } : undefined,
          include: { user: { select: { id: true, name: true, email: true } } },
        },
        modules: {
          include: { lessons: { select: { id: true } } },
        },
      },
    }),
    prisma.store.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
  ])

  const totalPages = Math.ceil(totalCourses / PAGE_SIZE)

  const enrolledUserIds = Array.from(
    new Set(courses.flatMap((c) => c.enrollments.map((e) => e.userId)))
  )
  const allLessonIds = courses.flatMap((c) =>
    c.modules.flatMap((m) => m.lessons.map((l) => l.id))
  )

  const allProgress =
    enrolledUserIds.length > 0 && allLessonIds.length > 0
      ? await prisma.lessonProgress.findMany({
          where: {
            completed: true,
            userId: { in: enrolledUserIds },
            lessonId: { in: allLessonIds },
          },
          select: { userId: true, lessonId: true },
        })
      : []

  const progressSet = new Set(allProgress.map((p) => `${p.userId}:${p.lessonId}`))

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Relatórios</h1>
          <p className="text-sm text-slate-500 mt-1">
            Progresso dos alunos por curso
            {totalCourses > 0 && (
              <span className="ml-2 text-slate-400">
                — {totalCourses} curso{totalCourses !== 1 ? 's' : ''} publicado{totalCourses !== 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>
        <StoreFilter stores={stores} currentStoreId={storeId} />
      </div>

      {courses.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 text-center">
          <p className="text-slate-400 text-sm">Nenhum curso publicado.</p>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {courses.map((course) => {
              const courseLessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id))
              const totalLessons = courseLessonIds.length

              return (
                <div
                  key={course.id}
                  className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden"
                >
                  <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-semibold text-slate-800">{course.name}</h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {totalLessons} aula{totalLessons !== 1 ? 's' : ''} · {course.enrollments.length} aluno{course.enrollments.length !== 1 ? 's' : ''} matriculado{course.enrollments.length !== 1 ? 's' : ''}
                        {storeId ? ' (filtrado)' : ''}
                      </p>
                    </div>
                  </div>

                  {course.enrollments.length === 0 ? (
                    <p className="px-5 py-3 text-sm text-slate-400">
                      {storeId ? 'Nenhum aluno desta loja matriculado.' : 'Nenhum aluno matriculado.'}
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50">
                          <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wide px-5 py-2.5">Aluno</th>
                          <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wide px-5 py-2.5">Progresso</th>
                          <th className="text-right text-xs font-medium text-slate-400 uppercase tracking-wide px-5 py-2.5">%</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {course.enrollments.map(({ user }) => {
                          const userCompleted = courseLessonIds.filter((lid) =>
                            progressSet.has(`${user.id}:${lid}`)
                          ).length
                          const percent =
                            totalLessons > 0
                              ? Math.round((userCompleted / totalLessons) * 100)
                              : 0

                          return (
                            <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-5 py-2.5">
                                <p className="text-sm font-medium text-slate-700">{user.name}</p>
                                <p className="text-xs text-slate-400">{user.email}</p>
                              </td>
                              <td className="px-5 py-2.5">
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 max-w-[180px] h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-blue-500 rounded-full"
                                      style={{ width: `${percent}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-slate-500 shrink-0">
                                    {userCompleted}/{totalLessons}
                                  </span>
                                </div>
                              </td>
                              <td className="px-5 py-2.5 text-right">
                                <span
                                  className={`text-xs font-semibold ${
                                    percent === 100
                                      ? 'text-green-600'
                                      : percent > 50
                                      ? 'text-blue-600'
                                      : 'text-slate-500'
                                  }`}
                                >
                                  {percent}%
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
            })}
          </div>

          <Pagination page={page} totalPages={totalPages} basePath="/admin/relatorios" searchParams={storeId ? { storeId } : {}} />
        </>
      )}
    </div>
  )
}
