import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrate() {
  const assessments = await prisma.assessment.findMany({
    where: { lessonId: { not: null }, moduleId: null },
    include: { lesson: { select: { moduleId: true } } },
  })
  let migrated = 0
  for (const a of assessments) {
    if (a.lesson?.moduleId) {
      await prisma.assessment.update({
        where: { id: a.id },
        data: { moduleId: a.lesson.moduleId },
      })
      migrated++
    }
  }
  console.log(`Migrated ${migrated} of ${assessments.length} assessments`)
  await prisma.$disconnect()
}

migrate().catch((e) => { console.error(e); process.exit(1) })
