import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, avatar: true },
  })
  return NextResponse.json(user)
}

export async function PUT(request: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { name?: string; currentPassword?: string; newPassword?: string; avatar?: string }
  try { body = await request.json() } catch { return NextResponse.json({ error: 'JSON inválido' }, { status: 400 }) }
  const { name, currentPassword, newPassword, avatar } = body
  const updates: Record<string, unknown> = {}

  if (name?.trim()) updates.name = name.trim()
  if (avatar !== undefined) updates.avatar = avatar || null

  if (newPassword) {
    if (!currentPassword)
      return NextResponse.json({ error: 'Informe a senha atual para alterá-la' }, { status: 400 })
    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (!user?.passwordHash)
      return NextResponse.json({ error: 'Sem senha definida' }, { status: 400 })
    const valid = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!valid)
      return NextResponse.json({ error: 'Senha atual incorreta' }, { status: 400 })
    if (newPassword.length < 6)
      return NextResponse.json({ error: 'A nova senha deve ter pelo menos 6 caracteres' }, { status: 400 })
    updates.passwordHash = await bcrypt.hash(newPassword, 10)
  }

  if (Object.keys(updates).length === 0)
    return NextResponse.json({ error: 'Nenhuma alteração informada' }, { status: 400 })

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: updates,
    select: { id: true, name: true, email: true },
  })
  return NextResponse.json(updated)
}
