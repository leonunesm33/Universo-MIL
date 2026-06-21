import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { can } from '@/lib/permissions'
import type { AppRole } from '@/types/next-auth'

interface Params { params: Promise<{ slug: string }> }

export async function GET(_req: Request, { params }: Params) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { slug } = await params
  const role = session.user.role as AppRole
  const isAdmin = can(role, 'admin_panel')

  const doc = await prisma.pOPDocument.findUnique({
    where: { slug },
    include: { createdBy: { select: { name: true } } },
  })

  if (!doc) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
  if (doc.status !== 'PUBLISHED' && !isAdmin) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  return NextResponse.json(doc)
}

export async function PUT(request: Request, { params }: Params) {
  const session = await auth()
  if (!session || !can(session.user.role as AppRole, 'admin_panel')) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const { slug } = await params
  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })

  const doc = await prisma.pOPDocument.findUnique({ where: { slug } })
  if (!doc) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

  const updated = await prisma.pOPDocument.update({
    where: { slug },
    data: {
      title: body.title?.trim() ?? doc.title,
      content: body.content ?? doc.content,
      category: body.category?.trim() ?? doc.category,
      order: body.order !== undefined ? Number(body.order) : doc.order,
      status: body.status === 'PUBLISHED' ? 'PUBLISHED' : body.status === 'DRAFT' ? 'DRAFT' : doc.status,
      fileUrl: 'fileUrl' in body ? (body.fileUrl?.trim() || null) : doc.fileUrl,
      linkUrl: 'linkUrl' in body ? (body.linkUrl?.trim() || null) : doc.linkUrl,
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth()
  if (!session || !can(session.user.role as AppRole, 'admin_panel')) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const { slug } = await params
  const doc = await prisma.pOPDocument.findUnique({ where: { slug } })
  if (!doc) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

  await prisma.pOPDocument.delete({ where: { slug } })
  return NextResponse.json({ ok: true })
}
