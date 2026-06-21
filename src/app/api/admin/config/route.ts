import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') return null
  return session
}

export async function GET() {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const config = await prisma.platformConfig.upsert({
    where: { id: 'singleton' },
    create: { id: 'singleton' },
    update: {},
  })

  return NextResponse.json(config)
}

export async function PUT(request: NextRequest) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { platformName, logoUrl, primaryColor, youtubeUrl, instagramUrl, facebookUrl, websiteUrl } = await request.json()

  const config = await prisma.platformConfig.upsert({
    where: { id: 'singleton' },
    create: {
      id: 'singleton',
      platformName: platformName ?? 'Universo Mil',
      logoUrl: logoUrl || null,
      primaryColor: primaryColor ?? '#EC55B5',
      youtubeUrl: youtubeUrl || null,
      instagramUrl: instagramUrl || null,
      facebookUrl: facebookUrl || null,
      websiteUrl: websiteUrl || null,
    },
    update: {
      platformName: platformName ?? 'Universo Mil',
      logoUrl: logoUrl || null,
      primaryColor: primaryColor ?? '#EC55B5',
      youtubeUrl: youtubeUrl || null,
      instagramUrl: instagramUrl || null,
      facebookUrl: facebookUrl || null,
      websiteUrl: websiteUrl || null,
    },
  })

  return NextResponse.json(config)
}
