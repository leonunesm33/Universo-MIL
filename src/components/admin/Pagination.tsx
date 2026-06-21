import Link from 'next/link'

interface PaginationProps {
  page: number
  totalPages: number
  basePath: string
  searchParams?: Record<string, string>
}

export function Pagination({ page, totalPages, basePath, searchParams = {} }: PaginationProps) {
  if (totalPages <= 1) return null

  function pageUrl(p: number) {
    const params = new URLSearchParams({ ...searchParams, page: String(p) })
    return `${basePath}?${params.toString()}`
  }

  const pages: (number | '...')[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (page > 3) pages.push('...')
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i)
    }
    if (page < totalPages - 2) pages.push('...')
    pages.push(totalPages)
  }

  return (
    <div className="flex items-center justify-center gap-1 mt-6">
      {page > 1 ? (
        <Link
          href={pageUrl(page - 1)}
          className="px-3 py-1.5 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          ← Anterior
        </Link>
      ) : (
        <span className="px-3 py-1.5 text-sm text-slate-300 border border-slate-100 rounded-lg cursor-default">
          ← Anterior
        </span>
      )}

      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="px-2 py-1.5 text-sm text-slate-400">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={pageUrl(p)}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              p === page
                ? 'bg-brand text-white border-brand font-medium'
                : 'text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {p}
          </Link>
        )
      )}

      {page < totalPages ? (
        <Link
          href={pageUrl(page + 1)}
          className="px-3 py-1.5 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          Próxima →
        </Link>
      ) : (
        <span className="px-3 py-1.5 text-sm text-slate-300 border border-slate-100 rounded-lg cursor-default">
          Próxima →
        </span>
      )}
    </div>
  )
}
