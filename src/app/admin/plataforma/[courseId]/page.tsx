import { auth } from '@/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { updateCourse, createModule } from '@/app/admin/actions/content'
import { CourseEditor } from './CourseEditor'

export default async function CourseEditPage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/login')

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      modules: {
        orderBy: { order: 'asc' },
        include: { lessons: { orderBy: { order: 'asc' } } },
      },
    },
  })
  if (!course) notFound()

  return (
    <div className="max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <Link href="/admin/plataforma" className="hover:text-slate-700">Plataforma</Link>
        <span>/</span>
        <span className="text-slate-700 font-medium truncate max-w-[200px]">{course.name}</span>
      </nav>

      {/* Course edit form */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Dados do Curso</h2>
        <form action={updateCourse.bind(null, courseId)} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Nome</label>
            <input
              name="name"
              defaultValue={course.name}
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-brand"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Descrição</label>
            <textarea
              name="description"
              defaultValue={course.description ?? ''}
              rows={3}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-brand resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">URL do Banner</label>
            <input
              name="banner"
              defaultValue={course.banner ?? ''}
              placeholder="https://..."
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-brand"
            />
          </div>
          <button
            type="submit"
            className="bg-brand hover:bg-brand/90 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Salvar Alterações
          </button>
        </form>
      </div>

      {/* Modules header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-slate-700">
          Módulos ({course.modules.length})
        </h2>
        <form action={createModule.bind(null, courseId)} className="flex gap-2">
          <input
            name="title"
            required
            placeholder="Nome do módulo"
            className="text-xs rounded-lg border border-slate-200 px-3 py-1.5 focus:outline-none focus:border-brand w-44"
          />
          <button
            type="submit"
            className="text-xs text-brand hover:text-brand/80 border border-brand/30 hover:border-brand/60 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
          >
            + Módulo
          </button>
        </form>
      </div>

      <CourseEditor modules={course.modules} courseId={courseId} />
    </div>
  )
}
