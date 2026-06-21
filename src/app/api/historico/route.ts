import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const progress = await prisma.lessonProgress.findMany({
    where: { userId: session.user.id, lesson: { module: { course: { status: 'PUBLISHED' } } } },
    orderBy: { updatedAt: 'desc' },
    take: 6,
    select: {
      lesson: {
        select: {
          id: true,
          title: true,
          slug: true,
          module: { select: { course: { select: { name: true, slug: true } } } },
        },
      },
    },
  })

  return NextResponse.json(
    progress.map(({ lesson: l }) => ({
      id: l.id,
      title: l.title,
      courseName: l.module.course.name,
      url: `/curso/${l.module.course.slug}/${l.slug}/${l.id}`,
    }))
  )
}
