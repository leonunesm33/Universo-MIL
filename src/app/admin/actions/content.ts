'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

async function requireAdmin() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/login')
  return session
}

// --- COURSES ---
export async function createCourse(formData: FormData) {
  await requireAdmin()
  const name = formData.get('name') as string
  if (!name?.trim()) return
  await prisma.course.create({
    data: {
      name: name.trim(),
      slug: slugify(name),
      description: (formData.get('description') as string) || null,
      banner: (formData.get('banner') as string) || null,
      status: 'DRAFT',
    },
  })
  revalidatePath('/admin/plataforma')
}

export async function updateCourse(courseId: string, formData: FormData) {
  await requireAdmin()
  const name = formData.get('name') as string
  if (!name?.trim()) return
  await prisma.course.update({
    where: { id: courseId },
    data: {
      name: name.trim(),
      slug: slugify(name),
      description: (formData.get('description') as string) || null,
      banner: (formData.get('banner') as string) || null,
    },
  })
  revalidatePath('/admin/plataforma')
  revalidatePath(`/admin/plataforma/${courseId}`)
}

export async function toggleCourseStatus(courseId: string, currentStatus: string) {
  await requireAdmin()
  await prisma.course.update({
    where: { id: courseId },
    data: { status: currentStatus === 'DRAFT' ? 'PUBLISHED' : 'DRAFT' },
  })
  revalidatePath('/admin/plataforma')
}

export async function deleteCourse(courseId: string) {
  await requireAdmin()
  await prisma.course.delete({ where: { id: courseId } })
  revalidatePath('/admin/plataforma')
}

// --- MODULES ---
export async function createModule(courseId: string, formData: FormData) {
  await requireAdmin()
  const title = formData.get('title') as string
  if (!title?.trim()) return
  const lastModule = await prisma.module.findFirst({
    where: { courseId },
    orderBy: { order: 'desc' },
    select: { order: true },
  })
  await prisma.module.create({
    data: {
      courseId,
      title: title.trim(),
      slug: slugify(title),
      order: (lastModule?.order ?? -1) + 1,
    },
  })
  revalidatePath(`/admin/plataforma/${courseId}`)
}

export async function updateModule(moduleId: string, courseId: string, formData: FormData) {
  await requireAdmin()
  const title = formData.get('title') as string
  if (!title?.trim()) return
  await prisma.module.update({
    where: { id: moduleId },
    data: { title: title.trim(), slug: slugify(title) },
  })
  revalidatePath(`/admin/plataforma/${courseId}`)
}

export async function deleteModule(moduleId: string, courseId: string) {
  await requireAdmin()
  await prisma.module.delete({ where: { id: moduleId } })
  revalidatePath(`/admin/plataforma/${courseId}`)
}

// --- LESSONS ---
export async function createLesson(moduleId: string, courseId: string, formData: FormData) {
  await requireAdmin()
  const title = formData.get('title') as string
  if (!title?.trim()) return
  const lastLesson = await prisma.lesson.findFirst({
    where: { moduleId },
    orderBy: { order: 'desc' },
    select: { order: true },
  })
  const rawDuration = formData.get('durationSecs')
  await prisma.lesson.create({
    data: {
      moduleId,
      title: title.trim(),
      slug: slugify(title),
      youtubeUrl: (formData.get('youtubeUrl') as string) || null,
      durationSecs: rawDuration ? Number(rawDuration) : null,
      description: (formData.get('description') as string) || null,
      type: (formData.get('type') as 'VIDEO' | 'ASSESSMENT') || 'VIDEO',
      order: (lastLesson?.order ?? -1) + 1,
    },
  })
  revalidatePath(`/admin/plataforma/${courseId}`)
}

export async function updateLesson(lessonId: string, courseId: string, formData: FormData) {
  await requireAdmin()
  const title = formData.get('title') as string
  if (!title?.trim()) return
  const rawDuration = formData.get('durationSecs')
  await prisma.lesson.update({
    where: { id: lessonId },
    data: {
      title: title.trim(),
      slug: slugify(title),
      youtubeUrl: (formData.get('youtubeUrl') as string) || null,
      documentUrl: (formData.get('documentUrl') as string) || null,
      durationSecs: rawDuration ? Number(rawDuration) : null,
      description: (formData.get('description') as string) || null,
    },
  })
  revalidatePath(`/admin/plataforma/${courseId}`)
}

export async function deleteLesson(lessonId: string, courseId: string) {
  await requireAdmin()
  await prisma.lesson.delete({ where: { id: lessonId } })
  revalidatePath(`/admin/plataforma/${courseId}`)
}

export async function reorderModule(moduleId: string, direction: 'up' | 'down', courseId: string) {
  await requireAdmin()
  const mod = await prisma.module.findUnique({ where: { id: moduleId }, select: { order: true } })
  if (!mod) return
  const targetOrder = direction === 'up' ? mod.order - 1 : mod.order + 1
  const sibling = await prisma.module.findFirst({
    where: { courseId, order: targetOrder },
    select: { id: true },
  })
  if (!sibling) return
  await prisma.$transaction([
    prisma.module.update({ where: { id: moduleId }, data: { order: targetOrder } }),
    prisma.module.update({ where: { id: sibling.id }, data: { order: mod.order } }),
  ])
  revalidatePath(`/admin/plataforma/${courseId}`)
}

export async function reorderLesson(lessonId: string, direction: 'up' | 'down', courseId: string) {
  await requireAdmin()
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { order: true, moduleId: true },
  })
  if (!lesson) return
  const targetOrder = direction === 'up' ? lesson.order - 1 : lesson.order + 1
  const sibling = await prisma.lesson.findFirst({
    where: { moduleId: lesson.moduleId, order: targetOrder },
    select: { id: true },
  })
  if (!sibling) return
  await prisma.$transaction([
    prisma.lesson.update({ where: { id: lessonId }, data: { order: targetOrder } }),
    prisma.lesson.update({ where: { id: sibling.id }, data: { order: lesson.order } }),
  ])
  revalidatePath(`/admin/plataforma/${courseId}`)
}
