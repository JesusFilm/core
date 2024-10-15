import { Prisma } from '.prisma/api-media-client'

export async function fakeDeferExistingQuestions({
  videoId,
  transaction
}: {
  videoId: string
  transaction: Prisma.TransactionClient
}): Promise<void> {
  const existing = await transaction.videoStudyQuestion.findMany({
    where: { videoId },
    select: { id: true },
    orderBy: { order: 'asc' }
  })

  let index = 1
  for (const studyQuestion of existing) {
    await transaction.videoStudyQuestion.update({
      where: { id: studyQuestion.id },
      data: { order: index + 1000 }
    })
    index++
  }
}
