import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { can } from '@/lib/permissions'
import type { AppRole } from '@/types/next-auth'

interface Params { params: Promise<{ id: string }> }

export async function POST(_req: Request, { params }: Params) {
  const session = await auth()
  if (!session || !can(session.user.role as AppRole, 'admin_panel')) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const { id } = await params
  const research = await prisma.climateResearch.findUnique({ where: { id } })
  if (!research) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

  const updated = await prisma.climateResearch.update({
    where: { id },
    data: { isActive: !research.isActive },
  })

  return NextResponse.json({ isActive: updated.isActive })
}
