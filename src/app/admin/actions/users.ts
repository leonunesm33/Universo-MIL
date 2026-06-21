'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import jwt from 'jsonwebtoken'
import { sendInviteEmail } from '@/lib/mailer'

const JWT_SECRET = process.env.JWT_SECRET!

async function requireAdmin() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/login')
  return session
}

export async function blockUser(userId: string, block: boolean) {
  await requireAdmin()
  await prisma.user.update({ where: { id: userId }, data: { blocked: block } })
  revalidatePath('/admin/alunos')
  revalidatePath(`/admin/alunos/${userId}`)
}

export async function enrollUserInCourse(userId: string, courseId: string) {
  await requireAdmin()
  const existing = await prisma.userCourse.findUnique({
    where: { userId_courseId: { userId, courseId } },
  })
  if (!existing) {
    await prisma.userCourse.create({ data: { userId, courseId } })
  }
  revalidatePath(`/admin/alunos/${userId}`)
}

export async function createStudentNote(
  studentId: string,
  content: string,
  visibleToStudent: boolean
) {
  const session = await requireAdmin()
  if (!content?.trim()) return
  await prisma.studentNote.create({
    data: {
      adminId: session.user.id,
      studentId,
      content: content.trim(),
      visibleToStudent,
    },
  })
  revalidatePath(`/admin/alunos/${studentId}`)
}

export async function deleteUser(userId: string) {
  await requireAdmin()
  await prisma.user.delete({ where: { id: userId } })
  revalidatePath('/admin/alunos')
}

export async function changeUserRole(userId: string, formData: FormData) {
  await requireAdmin()
  const role = formData.get('role') as string
  const validRoles = ['COLABORADOR', 'SUPERVISAO', 'GERENTE', 'GESTAO']
  if (!validRoles.includes(role)) return
  await prisma.user.update({ where: { id: userId }, data: { role: role as 'COLABORADOR' | 'SUPERVISAO' | 'GERENTE' | 'GESTAO' } })
  revalidatePath(`/admin/alunos/${userId}`)
  revalidatePath('/admin/alunos')
}

export async function saveUserProfile(userId: string, formData: FormData) {
  await requireAdmin()
  const role = formData.get('role') as string
  const storeId = formData.get('storeId') as string
  const validRoles = ['COLABORADOR', 'SUPERVISAO', 'GERENTE', 'GESTAO']
  if (!validRoles.includes(role)) return
  await prisma.user.update({
    where: { id: userId },
    data: {
      role: role as 'COLABORADOR' | 'SUPERVISAO' | 'GERENTE' | 'GESTAO',
      storeId: storeId || null,
    },
  })
  revalidatePath(`/admin/alunos/${userId}`)
  revalidatePath('/admin/alunos')
}

export async function inviteStudent(formData: FormData) {
  await requireAdmin()

  const name = String(formData.get('name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const storeId = String(formData.get('storeId') ?? '').trim() || null
  const roleRaw = String(formData.get('role') ?? '').trim()
  const validRoles = ['COLABORADOR', 'SUPERVISAO', 'GERENTE', 'GESTAO']
  const role = validRoles.includes(roleRaw) ? (roleRaw as 'COLABORADOR' | 'SUPERVISAO' | 'GERENTE' | 'GESTAO') : 'COLABORADOR'

  if (!name || !email) return

  const existing = await prisma.user.findUnique({ where: { email } })
  let userId: string

  if (existing) {
    userId = existing.id
    await prisma.user.update({ where: { id: userId }, data: { storeId: storeId ?? undefined, role } })
  } else {
    const created = await prisma.user.create({
      data: { name, email, role, storeId: storeId ?? undefined },
    })
    userId = created.id
  }

  // Invalidate previous unused tokens for this user
  await prisma.inviteToken.updateMany({
    where: { userId, usedAt: null },
    data: { expiresAt: new Date() },
  })

  const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000)
  const rawToken = jwt.sign({ userId, purpose: 'invite' }, JWT_SECRET, { expiresIn: '72h' })
  await prisma.inviteToken.create({ data: { userId, token: rawToken, expiresAt } })

  console.log(`\n[invite] Convite para ${email}:\n${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/convite?token=${rawToken}\n`)
  await sendInviteEmail(email, name, rawToken)

  revalidatePath('/admin/alunos')
}

export async function resendInvite(userId: string) {
  await requireAdmin()

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return

  // Invalidate previous unused tokens
  await prisma.inviteToken.updateMany({
    where: { userId, usedAt: null },
    data: { expiresAt: new Date() },
  })

  const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000)
  const rawToken = jwt.sign({ userId, purpose: 'invite' }, JWT_SECRET, { expiresIn: '72h' })
  await prisma.inviteToken.create({ data: { userId, token: rawToken, expiresAt } })

  console.log(`\n[invite] Reenvio para ${user.email}:\n${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/convite?token=${rawToken}\n`)
  await sendInviteEmail(user.email, user.name, rawToken)

  revalidatePath('/admin/alunos')
}
