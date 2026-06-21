import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { can } from '@/lib/permissions'
import type { AppRole } from '@/types/next-auth'

export async function GET() {
  const session = await auth()
  if (!session || !can(session.user.role as AppRole, 'admin_panel')) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const campaigns = await prisma.nPSCampaign.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { responses: true } } },
  })

  return NextResponse.json(campaigns)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session || !can(session.user.role as AppRole, 'admin_panel')) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const body = await request.json().catch(() => null)
  if (!body?.title?.trim()) {
    return NextResponse.json({ error: 'Título é obrigatório' }, { status: 400 })
  }

  const campaign = await prisma.nPSCampaign.create({
    data: {
      title: body.title.trim(),
      description: body.description?.trim() || null,
      isActive: true,
    },
  })

  return NextResponse.json(campaign, { status: 201 })
}
