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

interface NPSQuestionInput {
  text: string
  type: string
  order: number
  options?: string[] | null
}

interface NPSLeaderInput {
  name: string
}

async function upsertQuestions(campaignId: string, questions: NPSQuestionInput[]) {
  await prisma.nPSQuestion.deleteMany({ where: { campaignId } })
  for (const q of questions) {
    await prisma.nPSQuestion.create({
      data: {
        campaignId,
        text: q.text,
        type: q.type || 'SCALE',
        order: q.order,
        options: q.options ?? undefined,
      },
    })
  }
}

async function upsertLeaders(campaignId: string, leaders: NPSLeaderInput[]) {
  await prisma.nPSLeader.deleteMany({ where: { campaignId } })
  for (const l of leaders) {
    if (l.name?.trim()) {
      await prisma.nPSLeader.create({ data: { campaignId, name: l.name.trim() } })
    }
  }
}

export async function createNPSCampaign(formData: FormData) {
  await requireAdmin()
  const title = formData.get('title')?.toString().trim()
  const description = formData.get('description')?.toString().trim() || null
  const deadlineDateRaw = formData.get('deadlineDate')?.toString().trim() || null
  const questionsJson = formData.get('questionsJson')?.toString() ?? '[]'
  const leadersJson = formData.get('leadersJson')?.toString() ?? '[]'

  if (!title) throw new Error('Título é obrigatório')

  const campaign = await prisma.nPSCampaign.create({
    data: {
      title,
      description,
      isActive: true,
      deadlineDate: deadlineDateRaw ? new Date(deadlineDateRaw) : null,
    },
  })

  const questions: NPSQuestionInput[] = JSON.parse(questionsJson)
  if (questions.length > 0) await upsertQuestions(campaign.id, questions)

  const leaders: NPSLeaderInput[] = JSON.parse(leadersJson)
  if (leaders.length > 0) await upsertLeaders(campaign.id, leaders)

  revalidatePath('/admin/nps')
  redirect('/admin/nps')
}

export async function updateNPSCampaign(id: string, formData: FormData) {
  await requireAdmin()
  const title = formData.get('title')?.toString().trim()
  const description = formData.get('description')?.toString().trim() || null
  const deadlineDateRaw = formData.get('deadlineDate')?.toString().trim() || null
  const questionsJson = formData.get('questionsJson')?.toString() ?? '[]'
  const leadersJson = formData.get('leadersJson')?.toString() ?? '[]'

  if (!title) throw new Error('Título é obrigatório')

  await prisma.nPSCampaign.update({
    where: { id },
    data: {
      title,
      description,
      deadlineDate: deadlineDateRaw ? new Date(deadlineDateRaw) : null,
    },
  })

  const questions: NPSQuestionInput[] = JSON.parse(questionsJson)
  await upsertQuestions(id, questions)

  const leaders: NPSLeaderInput[] = JSON.parse(leadersJson)
  await upsertLeaders(id, leaders)

  revalidatePath('/admin/nps')
  revalidatePath(`/admin/nps/${id}/editar`)
  redirect('/admin/nps')
}
