import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { toggleCourseStatus } from '@/app/admin/actions/content'
import { DeleteCourseButton } from './DeleteCourseButton'

export default async function PlataformaPage() {
  const courses = await prisma.course.findMany({
    orderBy: { createdAt: 'asc' },
    include: {
      _count: { select: { modules: true, enrollments: true } },
    },
  })

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Plataforma</h1>
          <p className="text-sm text-slate-500 mt-1">{courses.length} curso(s)</p>
        </div>
        <Link
          href="/admin/plataforma/novo"
          className="text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          + Novo Curso
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-12 text-center">
          <p className="text-slate-400 text-sm mb-4">Nenhum curso criado ainda.</p>
          <Link
            href="/admin/plataforma/novo"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Criar primeiro curso →
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="h-28 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center relative">
                {course.banner ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={course.banner}
                    alt={course.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl opacity-40" role="img" aria-label="curso">🎓</span>
                )}
                <div className="absolute top-2 right-2">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      course.status === 'PUBLISHED'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {course.status === 'PUBLISHED' ? 'Publicado' : 'Rascunho'}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-slate-800 text-sm line-clamp-2 mb-1">
                  {course.name}
                </h3>
                <p className="text-xs text-slate-400 mb-3">
                  {course._count.modules} módulos · {course._count.enrollments} alunos
                </p>
                <div className="flex items-center gap-3">
                  <Link
                    href={`/admin/plataforma/${course.id}`}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Editar
                  </Link>
                  <span className="text-slate-200">·</span>
                  <form action={toggleCourseStatus.bind(null, course.id, course.status)}>
                    <button
                      type="submit"
                      className="text-xs text-slate-500 hover:text-slate-700"
                    >
                      {course.status === 'PUBLISHED' ? 'Despublicar' : 'Publicar'}
                    </button>
                  </form>
                  <span className="text-slate-200">·</span>
                  <DeleteCourseButton courseId={course.id} courseName={course.name} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
