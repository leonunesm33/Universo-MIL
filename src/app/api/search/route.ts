import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const q = (request.nextUrl.searchParams.get('q')?.trim() ?? '').slice(0, 100)
  if (q.length < 2) return NextResponse.json([])

  const lessons = await prisma.lesson.findMany({
    where: {
      title: { contains: q, mode: 'insensitive' },
      module: { course: { status: 'PUBLISHED' } },
    },
    select: {
      id: true,
      title: true,
      slug: true,
      module: { select: { course: { select: { name: true, slug: true } } } },
    },
    take: 8,
  })

  return NextResponse.json(
    lessons.map((l) => ({
      id: l.id,
      title: l.title,
      courseName: l.module.course.name,
      url: `/curso/${l.module.course.slug}/${l.slug}/${l.id}`,
    }))
  )
}
