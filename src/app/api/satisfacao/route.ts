import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const now = new Date()

  const campaign = await prisma.nPSCampaign.findFirst({
    where: {
      isActive: true,
      OR: [
        { deadlineDate: null },
        { deadlineDate: { gte: now } },
      ],
    },
    orderBy: { createdAt: 'desc' },
    include: {
      questions: { orderBy: { order: 'asc' } },
      leaders: { orderBy: { name: 'asc' } },
    },
  })

  if (!campaign) return NextResponse.json({ campaign: null })

  const alreadyAnswered = await prisma.nPSResponse.findFirst({
    where: { campaignId: campaign.id, responderId: session.user.id },
  })

  return NextResponse.json({ campaign, alreadyAnswered: !!alreadyAnswered })
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await request.json().catch(() => null)
  if (!body?.campaignId || body?.score === undefined) {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
  }

  const score = Number(body.score)
  if (isNaN(score) || score < 0 || score > 10) {
    return NextResponse.json({ error: 'Nota deve ser entre 0 e 10' }, { status: 400 })
  }

  const campaign = await prisma.nPSCampaign.findUnique({
    where: { id: body.campaignId },
    include: { questions: true },
  })

  if (!campaign || !campaign.isActive) {
    return NextResponse.json({ error: 'Campanha não encontrada ou inativa' }, { status: 404 })
  }

  const now = new Date()
  if (campaign.deadlineDate && campaign.deadlineDate < now) {
    return NextResponse.json({ error: 'O prazo para resposta expirou' }, { status: 400 })
  }

  const existing = await prisma.nPSResponse.findFirst({
    where: { campaignId: body.campaignId, responderId: session.user.id },
  })
  if (existing) {
    return NextResponse.json({ error: 'Você já respondeu esta pesquisa' }, { status: 409 })
  }

  const answers: { questionId: string; value: string }[] = Array.isArray(body.answers) ? body.answers : []

  const response = await prisma.nPSResponse.create({
    data: {
      campaignId: body.campaignId,
      responderId: session.user.id,
      leaderId: body.leaderId || null,
      score,
      comment: body.comment?.trim() || null,
      answers: {
        create: answers.map((a) => ({
          questionId: a.questionId,
          value: String(a.value),
        })),
      },
    },
  })

  return NextResponse.json({ ok: true, responseId: response.id }, { status: 201 })
}
