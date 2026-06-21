'use client'

import { useState } from 'react'

interface Module {
  id: string
  title: string
}

interface Course {
  id: string
  name: string
  modules: Module[]
}

export function CourseModuleSelector({ courses }: { courses: Course[] }) {
  const [selectedCourseId, setSelectedCourseId] = useState('')

  const selectedCourse = courses.find((c) => c.id === selectedCourseId)

  return (
    <>
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
          Curso *
        </label>
        <select
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
          required
          className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand bg-white"
        >
          <option value="">Selecione um curso…</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {selectedCourse && (
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
            Módulo *
          </label>
          <select
            name="moduleId"
            required
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand bg-white"
          >
            <option value="">Selecione um módulo…</option>
            {selectedCourse.modules.map((m) => (
              <option key={m.id} value={m.id}>{m.title}</option>
            ))}
          </select>
        </div>
      )}
    </>
  )
}
