import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const now = new Date()
  const research = await prisma.climateResearch.findFirst({
    where: {
      isActive: true,
      OR: [
        { startDate: null, endDate: null },
        { startDate: { lte: now }, endDate: null },
        { startDate: null, endDate: { gte: now } },
        { startDate: { lte: now }, endDate: { gte: now } },
      ],
    },
    orderBy: { createdAt: 'desc' },
    include: {
      questions: { orderBy: { order: 'asc' } },
    },
  })

  if (!research) return NextResponse.json({ research: null })

  const alreadyAnswered = await prisma.climateResponse.findFirst({
    where: { researchId: research.id, userId: session.user.id },
  })

  return NextResponse.json({ research, alreadyAnswered: !!alreadyAnswered })
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await request.json().catch(() => null)
  if (!body?.researchId || !Array.isArray(body?.answers)) {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
  }

  const research = await prisma.climateResearch.findUnique({
    where: { id: body.researchId },
    include: { questions: true },
  })

  if (!research || !research.isActive) {
    return NextResponse.json({ error: 'Pesquisa não encontrada ou inativa' }, { status: 404 })
  }

  const existing = await prisma.climateResponse.findFirst({
    where: { researchId: body.researchId, userId: session.user.id },
  })
  if (existing) {
    return NextResponse.json({ error: 'Você já respondeu esta pesquisa' }, { status: 409 })
  }

  const userRecord = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { storeId: true },
  })

  const response = await prisma.climateResponse.create({
    data: {
      researchId: body.researchId,
      userId: session.user.id,
      storeId: userRecord?.storeId ?? null,
      answers: {
        create: body.answers.map((a: { questionId: string; value: string }) => ({
          questionId: a.questionId,
          value: String(a.value),
        })),
      },
    },
  })

  return NextResponse.json({ ok: true, responseId: response.id }, { status: 201 })
}
