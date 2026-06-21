'use client'

interface Course {
  id: string
  name: string
}

export function CourseFilter({ courses, currentCourseId }: { courses: Course[]; currentCourseId?: string }) {
  return (
    <form method="GET">
      <select
        name="courseId"
        defaultValue={currentCourseId ?? ''}
        onChange={(e) => e.currentTarget.form!.submit()}
        className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-brand bg-white"
      >
        <option value="">Todos os cursos</option>
        {courses.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
    </form>
  )
}
