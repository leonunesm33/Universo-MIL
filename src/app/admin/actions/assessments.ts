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
  type: string
  order: number
  options: { text: string; isCorrect: boolean; order: number }[]
}

async function upsertQuestions(assessmentId: string, questions: QuestionInput[]) {
  await prisma.question.deleteMany({ where: { assessmentId } })
  for (const q of questions) {
    const created = await prisma.question.create({
      data: {
        assessmentId,
        text: q.text,
        type: q.type || 'SINGLE',
        order: q.order,
      },
    })
    for (const opt of q.options) {
      await prisma.option.create({
        data: {
          questionId: created.id,
          text: opt.text,
          isCorrect: opt.isCorrect,
          order: opt.order,
        },
      })
    }
  }
}

export async function createAssessment(formData: FormData) {
  await requireAdmin()
  const title = formData.get('title')?.toString().trim()
  const moduleId = formData.get('moduleId')?.toString()
  const type = (formData.get('type')?.toString() ?? 'COMMON') as 'COMMON' | 'CERT'
  const passingScore = formData.get('passingScore')?.toString()
  const questionsJson = formData.get('questionsJson')?.toString() ?? '[]'

  if (!title || !moduleId) throw new Error('Título e módulo são obrigatórios')

  const assessment = await prisma.assessment.create({
    data: {
      moduleId,
      title,
      type,
      passingScore: passingScore ? Number(passingScore) : null,
      status: 'ACTIVE',
    },
  })

  const questions: QuestionInput[] = JSON.parse(questionsJson)
  await upsertQuestions(assessment.id, questions)

  revalidatePath('/admin/avaliacoes')
  redirect('/admin/avaliacoes')
}

export async function updateAssessment(id: string, formData: FormData) {
  await requireAdmin()
  const title = formData.get('title')?.toString().trim()
  const type = (formData.get('type')?.toString() ?? 'COMMON') as 'COMMON' | 'CERT'
  const passingScore = formData.get('passingScore')?.toString()
  const questionsJson = formData.get('questionsJson')?.toString() ?? '[]'

  if (!title) throw new Error('Título é obrigatório')

  await prisma.assessment.update({
    where: { id },
    data: {
      title,
      type,
      passingScore: passingScore ? Number(passingScore) : null,
    },
  })

  const questions: QuestionInput[] = JSON.parse(questionsJson)
  await upsertQuestions(id, questions)

  revalidatePath('/admin/avaliacoes')
  revalidatePath(`/admin/avaliacoes/${id}`)
}

export async function toggleAssessmentStatus(id: string, currentStatus: string) {
  await requireAdmin()
  await prisma.assessment.update({
    where: { id },
    data: { status: currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' },
  })
  revalidatePath('/admin/avaliacoes')
  revalidatePath(`/admin/avaliacoes/${id}`)
}

export async function deleteAssessment(id: string) {
  await requireAdmin()
  await prisma.assessment.delete({ where: { id } })
  revalidatePath('/admin/avaliacoes')
  redirect('/admin/avaliacoes')
}
