import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { can } from '@/lib/permissions'
import type { AppRole } from '@/types/next-auth'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const role = session.user.role as AppRole
  const isAdmin = can(role, 'admin_panel')

  const docs = await prisma.pOPDocument.findMany({
    where: isAdmin ? undefined : { status: 'PUBLISHED' },
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    select: {
      id: true,
      title: true,
      slug: true,
      category: true,
      order: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  return NextResponse.json(docs)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session || !can(session.user.role as AppRole, 'admin_panel')) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const body = await request.json().catch(() => null)
  if (!body?.title || !body?.content) {
    return NextResponse.json({ error: 'Título e conteúdo são obrigatórios' }, { status: 400 })
  }

  const slug = body.slug?.trim()
    || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const existing = await prisma.pOPDocument.findUnique({ where: { slug } })
  if (existing) {
    return NextResponse.json({ error: 'Slug já existe' }, { status: 409 })
  }

  const doc = await prisma.pOPDocument.create({
    data: {
      title: body.title.trim(),
      slug,
      content: body.content,
      category: body.category?.trim() || null,
      order: Number(body.order) || 0,
      status: body.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT',
      fileUrl: body.fileUrl?.trim() || null,
      linkUrl: body.linkUrl?.trim() || null,
      createdById: session.user.id,
    },
  })

  return NextResponse.json(doc, { status: 201 })
}
