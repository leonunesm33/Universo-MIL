import { prisma } from '@/lib/prisma'
import { CourseFilter } from './CourseFilter'
import { StoreFilter } from '@/components/admin/StoreFilter'

function getLevel(score: number) {
  if (score >= 75) return { label: 'Platina', color: 'bg-cyan-100 text-cyan-700', dot: 'bg-cyan-500' }
  if (score >= 50) return { label: 'Ouro', color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-400' }
  if (score >= 25) return { label: 'Prata', color: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' }
  return { label: 'Bronze', color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-400' }
}

function getInitialsColor(name: string) {
  const colors = [
    'bg-rose-400', 'bg-pink-400', 'bg-fuchsia-400', 'bg-purple-400',
    'bg-indigo-400', 'bg-blue-400', 'bg-cyan-400', 'bg-teal-400',
    'bg-emerald-400', 'bg-amber-400',
  ]
  let hash = 0
  for (const c of name) hash = c.charCodeAt(0) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

export default async function RankingPage({
  searchParams,
}: {
  searchParams: Promise<{ courseId?: string; storeId?: string }>
}) {
  const { courseId, storeId } = await searchParams

  const [courses, stores] = await Promise.all([
    prisma.course.findMany({
      where: { status: 'PUBLISHED' },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
    prisma.store.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
  ])

  // Get totals for normalization
  const [totalLessonsCount, totalAssessmentsCount] = await Promise.all([
    prisma.lesson.count(
      courseId
        ? { where: { module: { courseId } } }
        : undefined
    ),
    prisma.assessment.count({
      where: {
        status: 'ACTIVE',
        ...(courseId ? { module: { courseId } } : {}),
      },
    }),
  ])

  const students = await prisma.user.findMany({
    where: {
      role: { not: 'ADMIN' },
      blocked: false,
      ...(storeId ? { storeId } : {}),
    },
    select: {
      id: true,
      name: true,
      email: true,
      lastAccessAt: true,
      progress: {
        where: {
          completed: true,
          ...(courseId ? { lesson: { module: { courseId } } } : {}),
        },
        select: { id: true },
      },
      assessments: {
        where: {
          passed: true,
          ...(courseId ? { assessment: { module: { courseId } } } : {}),
        },
        select: { id: true },
      },
      courses: courseId
        ? { where: { courseId }, select: { courseId: true } }
        : { select: { courseId: true } },
    },
  })

  const ranked = students
    .map((s) => {
      const completedLessons = s.progress.length
      const approvedAssessments = s.assessments.length
      const lessonScore = totalLessonsCount > 0 ? (completedLessons / totalLessonsCount) * 60 : 0
      const assessmentScore = totalAssessmentsCount > 0 ? (approvedAssessments / totalAssessmentsCount) * 40 : 0
      const score = Math.min(100, Math.round(lessonScore + assessmentScore))
      return { ...s, completedLessons, approvedAssessments, score }
    })
    .sort((a, b) => b.score - a.score)

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Ranking</h1>
          <p className="text-sm text-slate-500 mt-1">{ranked.length} alunas</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <StoreFilter stores={stores} currentStoreId={storeId} />
          <CourseFilter courses={courses} currentCourseId={courseId} />
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-5">
        {[
          { label: 'Bronze', from: 0, to: 24, color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-400' },
          { label: 'Prata', from: 25, to: 49, color: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' },
          { label: 'Ouro', from: 50, to: 74, color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-400' },
          { label: 'Platina', from: 75, to: 100, color: 'bg-cyan-100 text-cyan-700', dot: 'bg-cyan-500' },
        ].map((tier) => (
          <span key={tier.label} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${tier.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${tier.dot}`} />
            {tier.label} — {tier.from}–{tier.to} pts
          </span>
        ))}
      </div>

      {/* Scoring formula */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl px-5 py-3 mb-5 text-xs text-blue-700">
        <strong>Pontuação:</strong> (aulas concluídas / total de aulas) × 60 + (avaliações aprovadas / total de avaliações) × 40
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {ranked.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-slate-400 text-sm">Nenhuma aluna encontrada.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wide px-4 py-3 w-10">#</th>
                <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wide px-4 py-3">Aluna</th>
                <th className="text-center text-xs font-medium text-slate-400 uppercase tracking-wide px-4 py-3 hidden md:table-cell">Aulas</th>
                <th className="text-center text-xs font-medium text-slate-400 uppercase tracking-wide px-4 py-3 hidden lg:table-cell">Avaliações</th>
                <th className="text-center text-xs font-medium text-slate-400 uppercase tracking-wide px-4 py-3">Nível</th>
                <th className="text-right text-xs font-medium text-slate-400 uppercase tracking-wide px-4 py-3">Pontos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ranked.map((student, i) => {
                const level = getLevel(student.score)
                const color = getInitialsColor(student.name)
                const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : null
                return (
                  <tr key={student.id} className={`transition-colors ${i < 3 ? 'hover:bg-brand-muted/30' : 'hover:bg-slate-50'}`}>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-bold ${i < 3 ? 'text-brand' : 'text-slate-300'}`}>
                        {medal ?? `${i + 1}`}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${color} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                          {student.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-700 truncate">{student.name}</p>
                          <p className="text-xs text-slate-400 truncate">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center hidden md:table-cell">
                      <span className="text-sm text-slate-600">{student.completedLessons}</span>
                    </td>
                    <td className="px-4 py-3 text-center hidden lg:table-cell">
                      <span className="text-sm text-slate-600">{student.approvedAssessments}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${level.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${level.dot}`} />
                        {level.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-bold text-brand">{student.score}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  )
}
