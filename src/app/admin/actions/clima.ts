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

interface QuestionInput {
  text: string
  type: 'SCALE' | 'MULTIPLE' | 'TEXT'
  order: number
  required: boolean
  scaleMin?: number
  scaleMax?: number
  options?: string[]
}

async function upsertQuestions(researchId: string, questions: QuestionInput[]) {
  await prisma.climateQuestion.deleteMany({ where: { researchId } })
  for (const q of questions) {
    await prisma.climateQuestion.create({
      data: {
        researchId,
        text: q.text,
        type: q.type,
        order: q.order,
        required: q.required,
        scaleMin: q.scaleMin ?? 1,
        scaleMax: q.scaleMax ?? 5,
        options: q.options ? q.options : undefined,
      },
    })
  }
}

export async function createClimateResearch(formData: FormData) {
  await requireAdmin()
  const title = formData.get('title')?.toString().trim()
  const description = formData.get('description')?.toString().trim() || null
  const isAnonymous = formData.get('isAnonymous') === 'true'
  const fileUrl = formData.get('fileUrl')?.toString().trim() || null
  const linkUrl = formData.get('linkUrl')?.toString().trim() || null
  const startDateRaw = formData.get('startDate')?.toString().trim() || null
  const endDateRaw = formData.get('endDate')?.toString().trim() || null
  const questionsJson = formData.get('questionsJson')?.toString() ?? '[]'

  if (!title) throw new Error('Título é obrigatório')

  const research = await prisma.climateResearch.create({
    data: {
      title, description, isAnonymous, fileUrl, linkUrl,
      isActive: false,
      startDate: startDateRaw ? new Date(startDateRaw) : null,
      endDate: endDateRaw ? new Date(endDateRaw) : null,
    },
  })

  const questions: QuestionInput[] = JSON.parse(questionsJson)
  await upsertQuestions(research.id, questions)

  revalidatePath('/admin/clima')
  redirect('/admin/clima')
}

export async function updateClimateResearch(id: string, formData: FormData) {
  await requireAdmin()
  const title = formData.get('title')?.toString().trim()
  const description = formData.get('description')?.toString().trim() || null
  const isAnonymous = formData.get('isAnonymous') === 'true'
  const fileUrl = formData.get('fileUrl')?.toString().trim() || null
  const linkUrl = formData.get('linkUrl')?.toString().trim() || null
  const startDateRaw = formData.get('startDate')?.toString().trim() || null
  const endDateRaw = formData.get('endDate')?.toString().trim() || null
  const questionsJson = formData.get('questionsJson')?.toString() ?? '[]'

  if (!title) throw new Error('Título é obrigatório')

  await prisma.climateResearch.update({
    where: { id },
    data: {
      title, description, isAnonymous, fileUrl, linkUrl,
      startDate: startDateRaw ? new Date(startDateRaw) : null,
      endDate: endDateRaw ? new Date(endDateRaw) : null,
    },
  })

  const questions: QuestionInput[] = JSON.parse(questionsJson)
  await upsertQuestions(id, questions)

  revalidatePath('/admin/clima')
  revalidatePath(`/admin/clima/${id}/editar`)
  redirect('/admin/clima')
}

export async function deleteClimateResearch(id: string) {
  await requireAdmin()
  await prisma.climateResearch.delete({ where: { id } })
  revalidatePath('/admin/clima')
  redirect('/admin/clima')
}
