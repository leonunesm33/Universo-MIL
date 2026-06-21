import { prisma } from '@/lib/prisma'

export async function getDashboardMetrics(storeId?: string) {
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const userWhere = {
    role: { not: 'ADMIN' as const },
    ...(storeId ? { storeId } : {}),
  }

  const [
    totalStudents,
    activeStudents,
    totalCompleted,
    publishedCourses,
    recentStudents,
    loginLogs,
  ] = await Promise.all([
    prisma.user.count({ where: userWhere }),
    prisma.user.count({ where: { ...userWhere, lastAccessAt: { gte: sevenDaysAgo } } }),
    storeId
      ? prisma.lessonProgress.count({
          where: { completed: true, user: { storeId } },
        })
      : prisma.lessonProgress.count({ where: { completed: true } }),
    prisma.course.count({ where: { status: 'PUBLISHED' } }),
    prisma.user.findMany({
      where: userWhere,
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, name: true, email: true, createdAt: true, lastAccessAt: true },
    }),
    prisma.loginLog.findMany({
      where: { createdAt: { gte: thirtyDaysAgo }, ...(storeId ? { user: { storeId } } : {}) },
      select: { createdAt: true },
    }),
  ])

  // Group logins by day
  const loginsByDay: Record<string, number> = {}
  loginLogs.forEach(({ createdAt }) => {
    const day = createdAt.toISOString().split('T')[0]
    loginsByDay[day] = (loginsByDay[day] ?? 0) + 1
  })
  const loginChartData = Object.entries(loginsByDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date: date.slice(5), count }))

  // Top liked/disliked lessons
  const lessonLikes = await prisma.like.groupBy({
    by: ['lessonId', 'type'],
    _count: { id: true },
  })

  const likeMap: Record<string, number> = {}
  const dislikeMap: Record<string, number> = {}
  lessonLikes.forEach((r) => {
    if (r.type === 'LIKE') likeMap[r.lessonId] = r._count.id
    else dislikeMap[r.lessonId] = r._count.id
  })

  const allLessonIds = [
    ...new Set([...Object.keys(likeMap), ...Object.keys(dislikeMap)]),
  ]

  const lessonTitles =
    allLessonIds.length > 0
      ? await prisma.lesson.findMany({
          where: { id: { in: allLessonIds } },
          select: {
            id: true,
            title: true,
            module: { select: { course: { select: { name: true } } } },
          },
        })
      : []

  const lessonTitleMap = Object.fromEntries(
    lessonTitles.map((l) => [l.id, { title: l.title, courseName: l.module.course.name }])
  )

  const topLikedLessons = Object.entries(likeMap)
    .map(([id, likes]) => ({
      id,
      title: lessonTitleMap[id]?.title ?? '—',
      courseName: lessonTitleMap[id]?.courseName ?? '—',
      likes,
    }))
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 5)

  const topDislikedLessons = Object.entries(dislikeMap)
    .map(([id, dislikes]) => ({
      id,
      title: lessonTitleMap[id]?.title ?? '—',
      courseName: lessonTitleMap[id]?.courseName ?? '—',
      dislikes,
    }))
    .sort((a, b) => b.dislikes - a.dislikes)
    .slice(0, 5)

  // Course evolution
  const courses = await prisma.course.findMany({
    where: { status: 'PUBLISHED' },
    select: {
      id: true,
      name: true,
      modules: {
        select: {
          lessons: { select: { id: true } },
        },
      },
      enrollments: {
        where: storeId ? { user: { storeId } } : undefined,
        select: { userId: true },
      },
    },
  })

  const enrolledUserIds = [...new Set(courses.flatMap((c) => c.enrollments.map((e) => e.userId)))]
  const courseLessonMap: Record<string, string[]> = {}
  courses.forEach((c) => {
    courseLessonMap[c.id] = c.modules.flatMap((m) => m.lessons.map((l) => l.id))
  })

  const allCourseLessonIds = [...new Set(Object.values(courseLessonMap).flat())]
  const progressData =
    enrolledUserIds.length > 0 && allCourseLessonIds.length > 0
      ? await prisma.lessonProgress.findMany({
          where: {
            completed: true,
            userId: { in: enrolledUserIds },
            lessonId: { in: allCourseLessonIds },
          },
          select: { userId: true, lessonId: true },
        })
      : []

  const progressSet = new Set(progressData.map((p) => `${p.userId}:${p.lessonId}`))

  const courseProgress = courses.map((c) => {
    const lessonIds = courseLessonMap[c.id]
    const totalStudentsForCourse = c.enrollments.length
    if (totalStudentsForCourse === 0 || lessonIds.length === 0) {
      return { id: c.id, name: c.name, avgCompletion: 0, completedStudents: 0, totalStudents: 0 }
    }
    let completedStudents = 0
    c.enrollments.forEach(({ userId }) => {
      const allDone = lessonIds.every((lid) => progressSet.has(`${userId}:${lid}`))
      if (allDone) completedStudents++
    })
    const totalProgress = c.enrollments.reduce((sum, { userId }) => {
      const done = lessonIds.filter((lid) => progressSet.has(`${userId}:${lid}`)).length
      return sum + done / lessonIds.length
    }, 0)
    return {
      id: c.id,
      name: c.name,
      avgCompletion: Math.round((totalProgress / totalStudentsForCourse) * 100),
      completedStudents,
      totalStudents: totalStudentsForCourse,
    }
  })

  // Checklist avg
  const checklistStats = await prisma.checklistResponse.aggregate({
    where: storeId ? { storeId } : undefined,
    _avg: { score: true },
    _count: { id: true },
  })

  const checklistByStore = await prisma.checklistResponse.groupBy({
    by: ['storeId', 'storeName'],
    _avg: { score: true },
    _count: { id: true },
    orderBy: { _avg: { score: 'desc' } },
    take: 5,
  })

  const storeIds = checklistByStore.map((r) => r.storeId).filter(Boolean) as string[]
  const storeNames =
    storeIds.length > 0
      ? await prisma.store.findMany({
          where: { id: { in: storeIds } },
          select: { id: true, name: true },
        })
      : []
  const storeNameMap = Object.fromEntries(storeNames.map((s) => [s.id, s.name]))

  const checklistAvgScore = Math.round(checklistStats._avg.score ?? 0)
  const checklistResponseCount = checklistStats._count.id
  const checklistStoreCountResult = await prisma.checklistResponse.groupBy({
    by: ['storeId'],
    where: storeId ? { storeId } : undefined,
    _count: { id: true },
  })
  const checklistStoreCount = checklistStoreCountResult.length

  const checklistByStoreFormatted = checklistByStore.map((r) => ({
    storeId: r.storeId,
    storeName: r.storeId ? storeNameMap[r.storeId] ?? r.storeName : r.storeName,
    storeCode: null,
    avg: Math.round(r._avg.score ?? 0),
  }))

  // Clima avg
  const climateAnswers = await prisma.climateAnswer.findMany({
    where: { question: { type: 'SCALE' } },
    select: { value: true },
  })
  const climateNums = climateAnswers.map((a) => Number(a.value)).filter((n) => !isNaN(n))
  const climateAvg = climateNums.length > 0 ? climateNums.reduce((s, n) => s + n, 0) / climateNums.length : 0
  const climateResponseCount = await prisma.climateResponse.count()

  // NPS score
  const npsResponses = await prisma.nPSResponse.findMany({
    select: { score: true },
  })
  const npsTotal = npsResponses.length
  const npsPromoters = npsResponses.filter((r) => r.score >= 9).length
  const npsDetractors = npsResponses.filter((r) => r.score <= 6).length
  const npsScore = npsTotal > 0 ? Math.round(((npsPromoters - npsDetractors) / npsTotal) * 100) : 0

  return {
    totalStudents,
    activeStudents,
    totalCompleted,
    publishedCourses,
    recentStudents: recentStudents.map((s) => ({
      ...s,
      createdAt: s.createdAt.toISOString(),
      lastAccessAt: s.lastAccessAt?.toISOString() ?? null,
    })),
    loginChartData,
    topLikedLessons,
    topDislikedLessons,
    courseProgress,
    checklistAvgScore,
    checklistResponseCount,
    checklistStoreCount,
    checklistByStore: checklistByStoreFormatted,
    climateAvg,
    climateResponseCount,
    npsScore,
    npsPromoters,
    npsDetractors,
  }
}
