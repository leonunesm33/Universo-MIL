import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { PrintButton } from './PrintButton'

export default async function CertificadoPage({
  params,
}: {
  params: Promise<{ certificateId: string }>
}) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const { certificateId } = await params

  const cert = await prisma.certificate.findUnique({
    where: { id: certificateId },
    include: {
      user: { select: { id: true, name: true } },
      course: { select: { name: true } },
      module: { select: { title: true } },
    },
  })

  if (!cert) notFound()
  if (cert.userId !== session.user.id && session.user.role !== 'ADMIN') {
    redirect('/homepage')
  }

  const isModule = cert.type === 'MODULE'
  const subjectName = isModule ? cert.module?.title : cert.course?.name
  const typeLabel = isModule ? 'módulo' : 'curso'
  const issuedDate = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(cert.issuedAt))

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .certificate-card { box-shadow: none !important; border: 2px solid #d1d5db !important; }
        }
      `}</style>

      <div className="min-h-screen bg-[#0e0e0e] flex flex-col items-center justify-center p-6">
        <div className="no-print mb-6 flex items-center gap-4">
          <Link
            href="/perfil"
            className="text-sm text-white/50 hover:text-white/80 transition-colors"
          >
            ← Voltar ao perfil
          </Link>
          <PrintButton />
        </div>

        <div className="certificate-card bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex flex-col items-center justify-center p-12 text-center relative">
            <div
              className="absolute top-0 left-0 right-0 h-2"
              style={{ background: 'var(--brand, #EC55B5)' }}
            />

            <div className="mb-6 mt-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: '#fce7f3' }}
              >
                <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="#EC55B5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="6"/>
                  <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
                </svg>
              </div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                Certificado de Conclusão
              </p>
            </div>

            <p className="text-gray-500 text-sm mb-2">Certificamos que</p>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{cert.user.name}</h1>
            <p className="text-gray-500 text-sm mb-4">
              concluiu com êxito o {typeLabel}
            </p>
            <h2 className="text-xl font-semibold mb-6 text-pink-500">
              {subjectName}
            </h2>

            <p className="text-xs text-gray-400 mb-8">Emitido em {issuedDate}</p>

            <div className="w-32 h-px bg-gray-300 mx-auto mb-2" />
            <p className="text-xs text-gray-400">Plataforma de Treinamentos</p>

            <div
              className="absolute bottom-0 left-0 right-0 h-2"
              style={{ background: 'var(--brand, #EC55B5)' }}
            />
          </div>
        </div>
      </div>
    </>
  )
}
