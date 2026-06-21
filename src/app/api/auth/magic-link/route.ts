import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'
import { sendMagicLinkEmail } from '@/lib/mailer'

const JWT_SECRET = process.env.JWT_SECRET!
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? process.env.AUTH_URL ?? 'http://localhost:3000'

export async function POST(request: NextRequest) {
  const { email } = await request.json()
  if (!email) return NextResponse.json({ error: 'Email obrigatório' }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { email: String(email) } })
  // Always return 200 to avoid leaking which emails exist
  if (!user || user.blocked) {
    return NextResponse.json({ message: 'Se o email existir, você receberá o link.' })
  }

  const token = jwt.sign({ userId: user.id, purpose: 'magic-link' }, JWT_SECRET, { expiresIn: '15m' })
  const link = `${APP_URL}/magic-signin?token=${token}`

  console.log(`\n[magic-link] Link para ${email}:\n${link}\n`)
  await sendMagicLinkEmail(user.email, token)

  return NextResponse.json({ message: 'Se o email existir, você receberá o link.' })
}
