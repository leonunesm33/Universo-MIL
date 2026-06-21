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

  const templates = await prisma.checklistTemplate.findMany({
    where: isAdmin ? undefined : { status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { items: true, responses: true } },
    },
  })

  return NextResponse.json(templates)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session || !can(session.user.role as AppRole, 'checklist_answer')) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const body = await request.json().catch(() => null)
  if (!body?.templateId || !Array.isArray(body?.items)) {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
  }

  // Require either storeId or storeName
  if (!body.storeId && !body.storeName) {
    return NextResponse.json({ error: 'Informe a loja' }, { status: 400 })
  }

  const template = await prisma.checklistTemplate.findUnique({
    where: { id: body.templateId },
    include: { items: true },
  })

  if (!template || template.status !== 'ACTIVE') {
    return NextResponse.json({ error: 'Template não encontrado ou inativo' }, { status: 404 })
  }

  const requiredIds = template.items.filter((i) => i.required).map((i) => i.id)
  const answeredIds = body.items.map((a: { itemId: string }) => a.itemId)
  const missing = requiredIds.filter((id) => !answeredIds.includes(id))
  if (missing.length > 0) {
    return NextResponse.json({ error: `${missing.length} item(ns) obrigatório(s) sem resposta` }, { status: 400 })
  }

  // Resolve store info
  let storeName: string = body.storeName?.trim() ?? ''
  let storeCode: string | null = body.storeCode?.trim() || null
  let resolvedStoreId: string | null = null

  if (body.storeId) {
    const store = await prisma.store.findUnique({
      where: { id: body.storeId },
      select: { id: true, name: true, code: true },
    })
    if (!store) return NextResponse.json({ error: 'Loja não encontrada' }, { status: 404 })
    storeName = store.name
    storeCode = store.code ?? null
    resolvedStoreId = store.id
  }

  if (!storeName) {
    return NextResponse.json({ error: 'Informe o nome da loja' }, { status: 400 })
  }

  const totalItems = template.items.length
  const okCount = body.items.filter((a: { ok: boolean }) => a.ok === true).length
  const score = totalItems > 0 ? Math.round((okCount / totalItems) * 100) : null

  const userRecord = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { storeId: true },
  })

  const response = await prisma.checklistResponse.create({
    data: {
      templateId: body.templateId,
      responderId: session.user.id,
      storeName,
      storeCode,
      storeId: resolvedStoreId ?? userRecord?.storeId ?? null,
      notes: body.notes?.trim() || null,
      score,
      items: {
        create: body.items.map((a: { itemId: string; ok: boolean; note?: string }) => ({
          itemId: a.itemId,
          ok: Boolean(a.ok),
          note: a.note?.trim() || null,
        })),
      },
    },
  })

  return NextResponse.json({ ok: true, responseId: response.id, score }, { status: 201 })
}
