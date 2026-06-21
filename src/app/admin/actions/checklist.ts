'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/login')
  return session
}

interface ItemInput {
  text: string
  category: string
  order: number
  required: boolean
}

async function upsertItems(templateId: string, items: ItemInput[]) {
  await prisma.checklistItem.deleteMany({ where: { templateId } })
  for (const item of items) {
    await prisma.checklistItem.create({
      data: {
        templateId,
        text: item.text,
        category: item.category || null,
        order: item.order,
        required: item.required,
      },
    })
  }
}

export async function createChecklistTemplate(formData: FormData) {
  await requireAdmin()
  const title = formData.get('title')?.toString().trim()
  const description = formData.get('description')?.toString().trim() || null
  const fileUrl = formData.get('fileUrl')?.toString().trim() || null
  const linkUrl = formData.get('linkUrl')?.toString().trim() || null
  const itemsJson = formData.get('itemsJson')?.toString() ?? '[]'

  if (!title) throw new Error('Título é obrigatório')

  const template = await prisma.checklistTemplate.create({
    data: { title, description, fileUrl, linkUrl, status: 'INACTIVE' },
  })

  const items: ItemInput[] = JSON.parse(itemsJson)
  await upsertItems(template.id, items)

  revalidatePath('/admin/checklist')
  redirect('/admin/checklist')
}

export async function updateChecklistTemplate(id: string, formData: FormData) {
  await requireAdmin()
  const title = formData.get('title')?.toString().trim()
  const description = formData.get('description')?.toString().trim() || null
  const fileUrl = formData.get('fileUrl')?.toString().trim() || null
  const linkUrl = formData.get('linkUrl')?.toString().trim() || null
  const itemsJson = formData.get('itemsJson')?.toString() ?? '[]'

  if (!title) throw new Error('Título é obrigatório')

  await prisma.checklistTemplate.update({
    where: { id },
    data: { title, description, fileUrl, linkUrl },
  })

  const items: ItemInput[] = JSON.parse(itemsJson)
  await upsertItems(id, items)

  revalidatePath('/admin/checklist')
  revalidatePath(`/admin/checklist/${id}/editar`)
  redirect('/admin/checklist')
}

export async function deleteChecklistTemplate(id: string) {
  await requireAdmin()
  await prisma.checklistTemplate.delete({ where: { id } })
  revalidatePath('/admin/checklist')
  redirect('/admin/checklist')
}
