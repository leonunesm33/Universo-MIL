import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Header } from '@/components/student/Header'
import { Footer } from '@/components/student/Footer'

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) redirect('/login')

  const config = await prisma.platformConfig.findUnique({ where: { id: 'singleton' } })

  return (
    <div className="min-h-screen bg-[#141414] text-white flex flex-col">
      <Header
        user={{ name: session.user.name ?? '', email: session.user.email ?? '' }}
        role={session.user.role ?? 'COLABORADOR'}
        logoUrl={config?.logoUrl ?? null}
      />
      <main className="pt-14 flex-1">{children}</main>
      <Footer
        instagramUrl={config?.instagramUrl ?? 'https://www.instagram.com/milbijus/'}
        facebookUrl={config?.facebookUrl ?? 'https://www.facebook.com/MilBijus/?locale=pt_BR'}
        logoUrl={config?.logoUrl ?? null}
      />
    </div>
  )
}
