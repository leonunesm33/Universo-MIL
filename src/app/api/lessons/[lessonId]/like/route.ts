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
  const { type } = await request.json()

  if (type !== 'LIKE' && type !== 'DISLIKE') {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  }

  const key = { userId: session.user.id, lessonId }
  const existing = await prisma.like.findUnique({ where: { userId_lessonId: key } })

  if (existing) {
    if (existing.type === type) {
      await prisma.like.delete({ where: { userId_lessonId: key } })
      return NextResponse.json({ action: 'removed' })
    }
    await prisma.like.update({ where: { userId_lessonId: key }, data: { type } })
    return NextResponse.json({ action: 'changed', type })
  }

  await prisma.like.create({ data: { ...key, type } })
  return NextResponse.json({ action: 'added', type })
}
