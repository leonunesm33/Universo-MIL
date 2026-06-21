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
  const key = { userId: session.user.id, lessonId }
  const existing = await prisma.favorite.findUnique({ where: { userId_lessonId: key } })

  if (existing) {
    await prisma.favorite.delete({ where: { userId_lessonId: key } })
    return NextResponse.json({ favorited: false })
  }

  await prisma.favorite.create({ data: key })
  return NextResponse.json({ favorited: true })
}
