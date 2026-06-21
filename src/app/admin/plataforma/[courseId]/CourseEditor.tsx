'use client'

import { useState, useTransition, useRef } from 'react'
import { toast } from 'sonner'
import { FileUploadButton } from '@/components/admin/FileUploadButton'
import {
  updateModule,
  deleteModule,
  createLesson,
  updateLesson,
  deleteLesson,
  reorderModule,
  reorderLesson,
} from '@/app/admin/actions/content'

interface Lesson {
  id: string
  title: string
  youtubeUrl: string | null
  documentUrl: string | null
  description: string | null
  durationSecs: number | null
  type: string
  order: number
}

interface Module {
  id: string
  title: string
  order: number
  lessons: Lesson[]
}

function IconBtn({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
    >
      {children}
    </button>
  )
}

function EditModuleModal({
  mod,
  courseId,
  onClose,
}: {
  mod: Module
  courseId: string
  onClose: () => void
}) {
  const [pending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        await updateModule(mod.id, courseId, fd)
        toast.success('Módulo atualizado!')
        onClose()
      } catch {
        toast.error('Erro ao atualizar módulo')
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-base font-semibold text-slate-800 mb-4">Editar Módulo</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Título *</label>
            <input
              name="title"
              defaultValue={mod.title}
              required
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={pending}
              className="flex-1 bg-brand text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-brand/90 disabled:opacity-50"
            >
              {pending ? 'Salvando…' : 'Salvar'}
            </button>
            <button type="button" onClick={onClose} className="flex-1 border border-slate-200 text-slate-600 rounded-lg py-2.5 text-sm">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function AddLessonModal({
  moduleId,
  courseId,
  onClose,
}: {
  moduleId: string
  courseId: string
  onClose: () => void
}) {
  const [pending, startTransition] = useTransition()
  const [type, setType] = useState('VIDEO')
  const [documentUrl, setDocumentUrl] = useState('')
  const formRef = useRef<HTMLFormElement>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        await createLesson(moduleId, courseId, fd)
        toast.success('Aula criada!')
        onClose()
      } catch {
        toast.error('Erro ao criar aula')
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-base font-semibold text-slate-800 mb-4">Adicionar Aula</h2>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Título *</label>
            <input name="title" required placeholder="Título da aula" className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Tipo</label>
            <select name="type" value={type} onChange={(e) => setType(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand bg-white">
              <option value="VIDEO">Vídeo</option>
              <option value="ASSESSMENT">Avaliação</option>
            </select>
          </div>
          {type === 'VIDEO' && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">URL do YouTube</label>
              <input name="youtubeUrl" placeholder="https://youtube.com/watch?v=..." className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand" />
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Documento</label>
            <div className="flex items-center gap-2">
              <input
                name="documentUrl"
                value={documentUrl}
                onChange={(e) => setDocumentUrl(e.target.value)}
                placeholder="https://... ou /uploads/..."
                className="flex-1 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand"
              />
              <FileUploadButton onUpload={setDocumentUrl} label="Upload" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Descrição</label>
            <textarea name="description" rows={2} placeholder="Descrição da aula..." className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand resize-none" />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={pending} className="flex-1 bg-brand text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-brand/90 disabled:opacity-50">
              {pending ? 'Criando…' : 'Criar Aula'}
            </button>
            <button type="button" onClick={onClose} className="flex-1 border border-slate-200 text-slate-600 rounded-lg py-2.5 text-sm">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function EditLessonModal({
  lesson,
  courseId,
  onClose,
}: {
  lesson: Lesson
  courseId: string
  onClose: () => void
}) {
  const [pending, startTransition] = useTransition()
  const [documentUrl, setDocumentUrl] = useState(lesson.documentUrl ?? '')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        await updateLesson(lesson.id, courseId, fd)
        toast.success('Aula atualizada!')
        onClose()
      } catch {
        toast.error('Erro ao atualizar aula')
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-base font-semibold text-slate-800 mb-4">Editar Aula</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Título *</label>
            <input name="title" defaultValue={lesson.title} required className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand" />
          </div>
          {lesson.type === 'VIDEO' && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">URL do YouTube</label>
              <input name="youtubeUrl" defaultValue={lesson.youtubeUrl ?? ''} placeholder="https://youtube.com/watch?v=..." className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand" />
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Documento</label>
            <div className="flex items-center gap-2">
              <input
                name="documentUrl"
                value={documentUrl}
                onChange={(e) => setDocumentUrl(e.target.value)}
                placeholder="https://... ou /uploads/..."
                className="flex-1 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand"
              />
              <FileUploadButton onUpload={setDocumentUrl} label="Upload" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Duração (segundos)</label>
            <input name="durationSecs" type="number" defaultValue={lesson.durationSecs ?? ''} min={0} placeholder="ex: 600" className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Descrição</label>
            <textarea name="description" defaultValue={lesson.description ?? ''} rows={2} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand resize-none" />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={pending} className="flex-1 bg-brand text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-brand/90 disabled:opacity-50">
              {pending ? 'Salvando…' : 'Salvar'}
            </button>
            <button type="button" onClick={onClose} className="flex-1 border border-slate-200 text-slate-600 rounded-lg py-2.5 text-sm">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function CourseEditor({ modules, courseId }: { modules: Module[]; courseId: string }) {
  const [editingModule, setEditingModule] = useState<Module | null>(null)
  const [addLessonModuleId, setAddLessonModuleId] = useState<string | null>(null)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
  const [pending, startTransition] = useTransition()

  function handleReorderModule(moduleId: string, direction: 'up' | 'down') {
    startTransition(async () => {
      try {
        await reorderModule(moduleId, direction, courseId)
      } catch {
        toast.error('Erro ao reordenar módulo')
      }
    })
  }

  function handleReorderLesson(lessonId: string, direction: 'up' | 'down') {
    startTransition(async () => {
      try {
        await reorderLesson(lessonId, direction, courseId)
      } catch {
        toast.error('Erro ao reordenar aula')
      }
    })
  }

  function handleDeleteModule(moduleId: string) {
    if (!confirm('Excluir este módulo e todas as suas aulas?')) return
    startTransition(async () => {
      try {
        await deleteModule(moduleId, courseId)
        toast.success('Módulo excluído!')
      } catch {
        toast.error('Erro ao excluir módulo')
      }
    })
  }

  function handleDeleteLesson(lessonId: string) {
    if (!confirm('Excluir esta aula?')) return
    startTransition(async () => {
      try {
        await deleteLesson(lessonId, courseId)
        toast.success('Aula excluída!')
      } catch {
        toast.error('Erro ao excluir aula')
      }
    })
  }

  return (
    <>
      {editingModule && (
        <EditModuleModal
          mod={editingModule}
          courseId={courseId}
          onClose={() => setEditingModule(null)}
        />
      )}
      {addLessonModuleId && (
        <AddLessonModal
          moduleId={addLessonModuleId}
          courseId={courseId}
          onClose={() => setAddLessonModuleId(null)}
        />
      )}
      {editingLesson && (
        <EditLessonModal
          lesson={editingLesson}
          courseId={courseId}
          onClose={() => setEditingLesson(null)}
        />
      )}

      <div className={`space-y-4 ${pending ? 'opacity-60 pointer-events-none' : ''}`}>
        {modules.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 text-center">
            <p className="text-slate-400 text-sm">Nenhum módulo ainda. Adicione o primeiro.</p>
          </div>
        ) : (
          modules.map((mod, modIdx) => (
            <div key={mod.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => handleReorderModule(mod.id, 'up')}
                      disabled={modIdx === 0}
                      className="text-slate-300 hover:text-slate-600 disabled:opacity-20 leading-none text-xs"
                      title="Mover para cima"
                    >▲</button>
                    <button
                      onClick={() => handleReorderModule(mod.id, 'down')}
                      disabled={modIdx === modules.length - 1}
                      className="text-slate-300 hover:text-slate-600 disabled:opacity-20 leading-none text-xs"
                      title="Mover para baixo"
                    >▼</button>
                  </div>
                  <span className="text-sm font-semibold text-slate-700 truncate">{mod.title}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => setAddLessonModuleId(mod.id)}
                    className="text-xs text-brand hover:text-brand/80 font-medium"
                  >
                    + Aula
                  </button>
                  <button
                    onClick={() => setEditingModule(mod)}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteModule(mod.id)}
                    className="text-xs text-red-400 hover:text-red-600"
                  >
                    Excluir
                  </button>
                </div>
              </div>

              {mod.lessons.length === 0 ? (
                <p className="text-xs text-slate-400 px-4 py-3">Nenhuma aula ainda.</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {mod.lessons.map((lesson, lessonIdx) => (
                    <li key={lesson.id} className="flex items-center gap-3 px-4 py-2.5">
                      <div className="flex flex-col gap-0.5 shrink-0">
                        <button
                          onClick={() => handleReorderLesson(lesson.id, 'up')}
                          disabled={lessonIdx === 0}
                          className="text-slate-300 hover:text-slate-600 disabled:opacity-20 leading-none text-xs"
                          title="Mover para cima"
                        >▲</button>
                        <button
                          onClick={() => handleReorderLesson(lesson.id, 'down')}
                          disabled={lessonIdx === mod.lessons.length - 1}
                          className="text-slate-300 hover:text-slate-600 disabled:opacity-20 leading-none text-xs"
                          title="Mover para baixo"
                        >▼</button>
                      </div>
                      <span className="text-base shrink-0">
                        {lesson.type === 'VIDEO' ? '▶' : '📝'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm text-slate-700 truncate block">{lesson.title}</span>
                        {lesson.youtubeUrl && (
                          <span className="text-xs text-slate-400 truncate block">{lesson.youtubeUrl}</span>
                        )}
                        {lesson.documentUrl && (
                          <span className="text-xs text-blue-400 truncate block">Doc: {lesson.documentUrl}</span>
                        )}
                      </div>
                      {lesson.durationSecs != null && (
                        <span className="text-xs text-slate-400 shrink-0">
                          {Math.floor(lesson.durationSecs / 60)}:{String(lesson.durationSecs % 60).padStart(2, '0')}
                        </span>
                      )}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => setEditingLesson(lesson)}
                          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteLesson(lesson.id)}
                          className="text-xs text-red-400 hover:text-red-600"
                        >
                          ✕
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))
        )}
      </div>
    </>
  )
}
