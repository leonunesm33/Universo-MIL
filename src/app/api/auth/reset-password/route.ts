import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { sendPasswordResetEmail } from '@/lib/mailer'

const JWT_SECRET = process.env.JWT_SECRET!
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? process.env.AUTH_URL ?? 'http://localhost:3000'

export async function POST(request: NextRequest) {
  const { email } = await request.json()
  if (!email) return NextResponse.json({ ok: true })

  const user = await prisma.user.findUnique({ where: { email: String(email) } })
  if (!user || user.blocked) return NextResponse.json({ ok: true })

  const token = jwt.sign({ userId: user.id, purpose: 'reset-password' }, JWT_SECRET, { expiresIn: '1h' })
  const link = `${APP_URL}/redefinir-senha?token=${token}`
  console.log(`\n[reset-password] Link para ${email}:\n${link}\n`)
  await sendPasswordResetEmail(user.email, user.name, token)

  return NextResponse.json({ ok: true })
}

export async function PUT(request: NextRequest) {
  const { token, password } = await request.json()
  if (!token || !password || String(password).length < 6) {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
  }

  try {
    const payload = jwt.verify(String(token), JWT_SECRET) as { userId: string; purpose: string }
    if (payload.purpose !== 'reset-password') throw new Error('Purpose inválido')

    const hash = await bcrypt.hash(String(password), 12)
    await prisma.user.update({ where: { id: payload.userId }, data: { passwordHash: hash } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Link inválido ou expirado' }, { status: 400 })
  }
}
