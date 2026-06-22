import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { blockUser, createStudentNote, saveUserProfile } from '@/app/admin/actions/users'

export default async function AlunoPage({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  const { userId } = await params

  const [student, stores, certificates] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: {
        store: { select: { id: true, name: true } },
        loginLogs: { orderBy: { createdAt: 'desc' }, take: 5 },
        notesAboutMe: {
          include: { admin: { select: { name: true } } },
          orderBy: { updatedAt: 'desc' },
        },
      },
    }),
    prisma.store.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),
    prisma.certificate.findMany({
      where: { userId },
      orderBy: { issuedAt: 'desc' },
      include: {
        course: { select: { name: true } },
        module: { select: { title: true } },
      },
    }),
  ])

  if (!student) notFound()

  return (
    <div className="max-w-3xl mx-auto">
      <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <Link href="/admin/alunos" className="hover:text-slate-700">Alunos</Link>
        <span>/</span>
        <span className="text-slate-700 font-medium">{student.name}</span>
      </nav>

      {/* Profile card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-4">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl font-bold shrink-0">
            {student.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-slate-800">{student.name}</h1>
            <p className="text-sm text-slate-500">{student.email}</p>
            <p className="text-sm text-slate-400 mt-0.5">
              Loja: {student.store?.name ?? '—'}
            </p>
            <div className="flex items-center gap-3 mt-2">
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  student.blocked
                    ? 'bg-red-100 text-red-600'
                    : 'bg-green-100 text-green-600'
                }`}
              >
                {student.blocked ? 'Bloqueado' : 'Ativo'}
              </span>
              <span className="text-xs text-slate-400">
                Cadastro: {student.createdAt.toLocaleDateString('pt-BR')}
              </span>
              {student.lastAccessAt && (
                <span className="text-xs text-slate-400">
                  Último acesso: {student.lastAccessAt.toLocaleDateString('pt-BR')}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <form action={blockUser.bind(null, userId, !student.blocked)}>
            <button
              type="submit"
              className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
                student.blocked
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {student.blocked ? 'Desbloquear Acesso' : 'Bloquear Acesso'}
            </button>
          </form>
        </div>
      </div>

      {/* Combined role + store form */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-4">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Grupo e Loja</h2>
        <form action={saveUserProfile.bind(null, userId)} className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Grupo</label>
            <select
              name="role"
              defaultValue={student.role}
              className="text-sm rounded-lg border border-slate-200 px-3 py-2 bg-white focus:outline-none focus:border-brand"
            >
              <option value="COLABORADOR">Colaborador</option>
              <option value="SUPERVISAO">Supervisão</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          {stores.length > 0 && (
            <div>
              <label className="block text-xs text-slate-500 mb-1">Loja</label>
              <select
                name="storeId"
                defaultValue={student.store?.id ?? ''}
                className="text-sm rounded-lg border border-slate-200 px-3 py-2 bg-white focus:outline-none focus:border-brand"
              >
                <option value="">Sem loja</option>
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          )}
          <button
            type="submit"
            className="text-sm bg-brand text-white px-4 py-2 rounded-lg hover:bg-brand/90 transition-colors"
          >
            Salvar
          </button>
        </form>
      </div>

      {/* Admin Notes */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-4">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Notas do Admin</h2>
        <AddNoteForm studentId={userId} />
        {student.notesAboutMe.length === 0 ? (
          <p className="text-sm text-slate-400 mt-3">Nenhuma nota.</p>
        ) : (
          <div className="space-y-3 mt-4">
            {student.notesAboutMe.map((note) => (
              <div
                key={note.id}
                className="rounded-lg bg-slate-50 border border-slate-100 p-3"
              >
                <p className="text-sm text-slate-700">{note.content}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {note.admin.name} · {note.updatedAt.toLocaleDateString('pt-BR')}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Certificates */}
      {certificates.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-4">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">
            Certificados ({certificates.length})
          </h2>
          <div className="space-y-2">
            {certificates.map((c) => {
              const name = c.type === 'MODULE' ? c.module?.title : c.course?.name
              const label = c.type === 'MODULE' ? 'Módulo' : 'Curso'
              return (
                <div
                  key={c.id}
                  className="flex items-center justify-between gap-3 bg-slate-50 rounded-lg px-4 py-2.5"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-700">{name}</p>
                    <p className="text-xs text-slate-400">
                      {label} · {c.issuedAt.toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <Link
                    href={`/certificado/${c.id}`}
                    target="_blank"
                    className="text-xs text-brand hover:underline shrink-0"
                  >
                    Ver →
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Login history */}
      {student.loginLogs.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Últimos Logins</h2>
          <div className="space-y-1">
            {student.loginLogs.map((log) => (
              <p key={log.id} className="text-sm text-slate-500">
                {log.createdAt.toLocaleString('pt-BR')}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function AddNoteForm({ studentId }: { studentId: string }) {
  async function handleAddNote(formData: FormData) {
    'use server'
    const content = formData.get('content') as string
    if (content?.trim()) await createStudentNote(studentId, content, false)
  }

  return (
    <form action={handleAddNote} className="flex gap-2">
      <input
        name="content"
        placeholder="Adicionar nota interna..."
        className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
      />
      <button
        type="submit"
        className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
      >
        Salvar
      </button>
    </form>
  )
}
