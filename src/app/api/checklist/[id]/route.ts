import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { can } from '@/lib/permissions'
import type { AppRole } from '@/types/next-auth'

interface Params { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  const session = await auth()
  if (!session || !can(session.user.role as AppRole, 'checklist_answer')) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const { id } = await params
  const template = await prisma.checklistTemplate.findUnique({
    where: { id },
    include: { items: { orderBy: { order: 'asc' } } },
  })

  if (!template) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
  if (template.status !== 'ACTIVE' && !can(session.user.role as AppRole, 'admin_panel')) {
    return NextResponse.json({ error: 'Template inativo' }, { status: 403 })
  }

  return NextResponse.json(template)
}

export async function PUT(request: Request, { params }: Params) {
  const session = await auth()
  if (!session || !can(session.user.role as AppRole, 'admin_panel')) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const { id } = await params
  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })

  const template = await prisma.checklistTemplate.findUnique({ where: { id } })
  if (!template) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

  const updated = await prisma.checklistTemplate.update({
    where: { id },
    data: {
      title: body.title?.trim() ?? template.title,
      description: body.description?.trim() ?? template.description,
      status: body.status === 'ACTIVE' || body.status === 'INACTIVE' ? body.status : template.status,
    },
  })

  return NextResponse.json(updated)
}
