import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { can } from '@/lib/permissions'
import type { AppRole } from '@/types/next-auth'

interface Params { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  const session = await auth()
  if (!session || !can(session.user.role as AppRole, 'admin_panel')) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const { id } = await params
  const campaign = await prisma.nPSCampaign.findUnique({
    where: { id },
    include: {
      responses: {
        include: { responder: { select: { name: true, email: true } } },
        orderBy: { submittedAt: 'desc' },
      },
    },
  })

  if (!campaign) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
  return NextResponse.json(campaign)
}

export async function PATCH(request: Request, { params }: Params) {
  const session = await auth()
  if (!session || !can(session.user.role as AppRole, 'admin_panel')) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const { id } = await params
  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })

  const campaign = await prisma.nPSCampaign.findUnique({ where: { id } })
  if (!campaign) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

  const updated = await prisma.nPSCampaign.update({
    where: { id },
    data: {
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : campaign.isActive,
      closedAt: body.isActive === false && campaign.isActive ? new Date() : campaign.closedAt,
    },
  })

  return NextResponse.json(updated)
}
