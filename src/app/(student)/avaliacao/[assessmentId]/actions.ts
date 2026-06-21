'use server'

import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export async function submitAssessment(
  assessmentId: string,
  answers: Record<string, string>
): Promise<{ score: number; passed: boolean }> {
  const session = await auth()
  if (!session) redirect('/login')

  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId, status: 'ACTIVE' },
    include: {
      questions: {
        include: { options: { select: { id: true, isCorrect: true } } },
      },
    },
  })

  if (!assessment) throw new Error('Avaliação não encontrada')

  let correct = 0
  for (const question of assessment.questions) {
    const chosenId = answers[question.id]
    if (chosenId) {
      const chosenOption = question.options.find((o) => o.id === chosenId)
      if (chosenOption?.isCorrect) correct++
    }
  }

  const total = assessment.questions.length
  const score = total > 0 ? Math.round((correct / total) * 100) : 0
  const passed = assessment.passingScore != null ? score >= assessment.passingScore : score >= 70

  await prisma.assessmentResponse.create({
    data: {
      userId: session.user.id,
      assessmentId,
      answers: answers as Record<string, string>,
      score,
      passed,
    },
  })

  return { score, passed }
}
