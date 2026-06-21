'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { can } from '@/lib/permissions'
import type { AppRole } from '@/types/next-auth'

async function requireAdmin() {
  const session = await auth()
  if (!session || !can(session.user.role as AppRole, 'admin_panel')) {
    throw new Error('Não autorizado')
  }
  return session
}

export async function createStore(formData: FormData) {
  await requireAdmin()
  const name = formData.get('name')?.toString().trim()
  const code = formData.get('code')?.toString().trim() || null

  if (!name) throw new Error('Nome é obrigatório')

  await prisma.store.create({ data: { name, code } })
  revalidatePath('/admin/configuracoes')
}

export async function updateStore(id: string, formData: FormData) {
  await requireAdmin()
  const name = formData.get('name')?.toString().trim()
  const code = formData.get('code')?.toString().trim() || null

  if (!name) throw new Error('Nome é obrigatório')

  await prisma.store.update({ where: { id }, data: { name, code } })
  revalidatePath('/admin/configuracoes')
}

export async function toggleStore(id: string, isActive: boolean) {
  await requireAdmin()
  await prisma.store.update({ where: { id }, data: { isActive } })
  revalidatePath('/admin/configuracoes')
}

export async function deleteStore(id: string) {
  await requireAdmin()
  await prisma.store.delete({ where: { id } })
  revalidatePath('/admin/configuracoes')
}
