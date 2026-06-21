import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const doc = await prisma.pOPDocument.findUnique({ where: { slug }, select: { title: true } })
  return { title: doc?.title ?? 'POP' }
}

export default async function POPDocumentPage({ params }: Props) {
  await auth()

  const { slug } = await params
  const doc = await prisma.pOPDocument.findUnique({
    where: { slug },
    include: { createdBy: { select: { name: true } } },
  })

  if (!doc || doc.status !== 'PUBLISHED') notFound()

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link
        href="/pop"
        className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors mb-6"
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Voltar à lista
      </Link>

      <header className="mb-8 border-b border-white/10 pb-6">
        {doc.category && (
          <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-[var(--brand)]/20 text-[var(--brand)] mb-3">
            {doc.category}
          </span>
        )}
        <h1 className="text-2xl font-bold text-white leading-snug">{doc.title}</h1>
        <p className="text-sm text-white/40 mt-2">
          Atualizado em {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(new Date(doc.updatedAt))}
          {doc.createdBy?.name && ` · ${doc.createdBy.name}`}
        </p>
      </header>

      <article className="prose prose-invert prose-sm max-w-none prose-headings:text-white prose-a:text-[var(--brand)] prose-strong:text-white prose-code:text-[var(--brand)] prose-pre:bg-white/10 prose-blockquote:border-[var(--brand)] prose-blockquote:text-white/70">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {doc.content}
        </ReactMarkdown>
      </article>

      {(doc.fileUrl || doc.linkUrl) && (
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap gap-3">
          {doc.fileUrl && (
            <a
              href={doc.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              Abrir documento
            </a>
          )}
          {doc.linkUrl && (
            <a
              href={doc.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--brand)]/20 hover:bg-[var(--brand)]/30 text-[var(--brand)] text-sm font-medium transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
              Acessar link
            </a>
          )}
        </div>
      )}
    </div>
  )
}
