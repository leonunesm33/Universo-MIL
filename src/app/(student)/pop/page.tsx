import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const metadata = { title: 'POP — Procedimentos Operacionais Padrão' }

function CategoryBadge({ category }: { category: string | null }) {
  if (!category) return null
  return (
    <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-white/10 text-white/70">
      {category}
    </span>
  )
}

export default async function POPListPage() {
  await auth()

  const docs = await prisma.pOPDocument.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: [{ order: 'asc' }, { title: 'asc' }],
    select: { id: true, title: true, slug: true, category: true, updatedAt: true },
  })

  const grouped = docs.reduce<Record<string, typeof docs>>((acc, doc) => {
    const key = doc.category ?? 'Geral'
    if (!acc[key]) acc[key] = []
    acc[key].push(doc)
    return acc
  }, {})

  const categories = Object.keys(grouped).sort()

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Procedimentos Operacionais Padrão</h1>
        <p className="text-white/60 mt-1 text-sm">Consulte os procedimentos e normas da empresa</p>
      </div>

      {docs.length === 0 ? (
        <div className="text-center py-20 text-white/40">
          <svg viewBox="0 0 24 24" className="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          <p>Nenhum procedimento publicado ainda.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {categories.map((cat) => (
            <div key={cat}>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-3">{cat}</h2>
              <div className="divide-y divide-white/8 rounded-xl overflow-hidden border border-white/10 bg-white/5">
                {grouped[cat].map((doc) => (
                  <Link
                    key={doc.id}
                    href={`/pop/${doc.slug}`}
                    className="flex items-center justify-between px-5 py-4 hover:bg-white/8 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <svg viewBox="0 0 24 24" className="w-5 h-5 text-[var(--brand)] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                        <polyline points="10 9 9 9 8 9"/>
                      </svg>
                      <span className="font-medium text-white truncate">{doc.title}</span>
                      <CategoryBadge category={doc.category} />
                    </div>
                    <svg viewBox="0 0 24 24" className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
