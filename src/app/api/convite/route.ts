import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET!

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')
  if (!token) return NextResponse.json({ valid: false })

  const invite = await prisma.inviteToken.findUnique({
    where: { token },
    include: { user: { select: { name: true, blocked: true } } },
  })

  if (!invite || invite.usedAt || invite.expiresAt < new Date() || invite.user.blocked) {
    return NextResponse.json({ valid: false })
  }

  return NextResponse.json({ valid: true, name: invite.user.name })
}

export async function POST(request: NextRequest) {
  const { token, password } = await request.json()
  if (!token || !password || String(password).length < 6) {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
  }

  const invite = await prisma.inviteToken.findUnique({
    where: { token: String(token) },
    include: { user: true },
  })

  if (!invite || invite.usedAt || invite.expiresAt < new Date() || invite.user.blocked) {
    return NextResponse.json({ error: 'Convite inválido ou expirado' }, { status: 400 })
  }

  const hash = await bcrypt.hash(String(password), 12)

  await prisma.$transaction([
    prisma.user.update({
      where: { id: invite.userId },
      data: { passwordHash: hash, lastAccessAt: new Date() },
    }),
    prisma.inviteToken.update({
      where: { id: invite.id },
      data: { usedAt: new Date() },
    }),
    prisma.loginLog.create({ data: { userId: invite.userId } }),
  ])

  // Issue a short-lived JWT so the client can sign in via the magic-link provider
  const sessionToken = jwt.sign(
    { userId: invite.userId, purpose: 'invite' },
    JWT_SECRET,
    { expiresIn: '5m' }
  )

  return NextResponse.json({ ok: true, sessionToken })
}
