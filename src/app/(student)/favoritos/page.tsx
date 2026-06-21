import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function FavoritosPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      lesson: {
        include: {
          module: { include: { course: true } },
        },
      },
    },
  })

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-8">
      <h1 className="text-2xl font-bold text-white mb-2">Favoritos</h1>
      <p className="text-sm text-gray-500 mb-8">
        {favorites.length === 0 ? 'Nenhuma aula salva' : favorites.length === 1 ? '1 aula salva' : `${favorites.length} aulas salvas`}
      </p>

      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center rounded-xl border border-[#2a2a2a] bg-[#1a1a1a]">
          <span className="text-5xl mb-4 opacity-30">♡</span>
          <p className="text-gray-500 text-sm mb-2">Nenhuma aula favoritada ainda.</p>
          <Link href="/homepage" className="text-brand hover:text-brand-dark text-sm transition-colors">
            Explorar cursos →
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map(({ lesson }) => (
            <Link
              key={lesson.id}
              href={`/curso/${lesson.module.course.slug}/${lesson.slug}/${lesson.id}`}
              className="group block rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] p-4 hover:border-[#3a3a3a] hover:bg-[#222] transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-brand-muted flex items-center justify-center shrink-0">
                  <span className="text-brand text-sm">▶</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white group-hover:text-white line-clamp-2 mb-1">
                    {lesson.title}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {lesson.module.course.name}
                  </p>
                  <p className="text-xs text-gray-600 truncate">
                    {lesson.module.title}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
