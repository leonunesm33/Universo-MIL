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

  let newCertificates: string[] = []

  if (completed) {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          include: {
            lessons: { select: { id: true } },
            course: {
              include: {
                modules: { include: { lessons: { select: { id: true } } } },
              },
            },
          },
        },
      },
    })

    if (lesson?.module) {
      const { module } = lesson
      const moduleLessonIds = module.lessons.map((l) => l.id)

      const moduleDoneCount = await prisma.lessonProgress.count({
        where: {
          userId: session.user.id,
          lessonId: { in: moduleLessonIds },
          completed: true,
        },
      })

      if (moduleDoneCount >= moduleLessonIds.length) {
        const existingModCert = await prisma.certificate.findFirst({
          where: { userId: session.user.id, moduleId: module.id, type: 'MODULE' },
        })
        if (!existingModCert) {
          const cert = await prisma.certificate.create({
            data: { userId: session.user.id, moduleId: module.id, type: 'MODULE' },
          })
          newCertificates.push(cert.id)
        }

        const allCourseLessonIds = module.course.modules.flatMap((m) =>
          m.lessons.map((l) => l.id)
        )
        const courseDoneCount = await prisma.lessonProgress.count({
          where: {
            userId: session.user.id,
            lessonId: { in: allCourseLessonIds },
            completed: true,
          },
        })

        if (courseDoneCount >= allCourseLessonIds.length) {
          const existingCourseCert = await prisma.certificate.findFirst({
            where: { userId: session.user.id, courseId: module.course.id, type: 'COURSE' },
          })
          if (!existingCourseCert) {
            const cert = await prisma.certificate.create({
              data: { userId: session.user.id, courseId: module.course.id, type: 'COURSE' },
            })
            newCertificates.push(cert.id)
          }
        }
      }
    }
  }

  return NextResponse.json({
    ok: true,
    completed: progress.completed,
    newCertificates,
  })
}
