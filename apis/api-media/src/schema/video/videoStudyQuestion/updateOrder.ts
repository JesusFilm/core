import { Prisma } from '@core/prisma/media/client'

interface updateOrderUpdateParams {
  videoId: string
  languageId: string
  id: string
  order: number
  transaction: Prisma.TransactionClient
}

export async function updateOrderUpdate({
  videoId,
  languageId,
  id,
  order,
  transaction
}: updateOrderUpdateParams): Promise<void> {
  if (order < 1) throw new Error('order must be greater than 0')

  const existing = await transaction.videoStudyQuestion.findMany({
    where: { videoId, languageId },
    select: { id: true, order: true },
    orderBy: { order: 'asc' }
  })

  for (const studyQuestion of existing)
    await transaction.videoStudyQuestion.update({
      where: { id: studyQuestion.id },
      data: { order: studyQuestion.order + 1000 }
    })

  const newOrders = existing
    .filter((item) => item.id !== id)
    .map(({ id }) => id)

  newOrders.splice(order - 1, 0, id)

  for (let index = 0; index < newOrders.length; index++) {
    await transaction.videoStudyQuestion.update({
      where: { id: newOrders[index] },
      data: { order: index + 1 }
    })
  }
}

interface createOrderUpdateParams {
  videoId: string
  languageId: string
  order: number
  transaction: Prisma.TransactionClient
}

export async function updateOrderCreate({
  videoId,
  languageId,
  order = 0,
  transaction
}: createOrderUpdateParams): Promise<void> {
  const existing = await transaction.videoStudyQuestion.findMany({
    where: { videoId, languageId },
    select: { id: true, order: true },
    orderBy: { order: 'asc' }
  })

  for (const studyQuestion of existing)
    await transaction.videoStudyQuestion.update({
      where: { id: studyQuestion.id },
      data: { order: studyQuestion.order + 1000 }
    })

  const newOrders = existing.map(({ id }) => id)

  for (let index = 1; index <= newOrders.length; index++) {
    await transaction.videoStudyQuestion.update({
      where: { id: newOrders[index - 1] },
      data: { order: index >= order ? index + 1 : index }
    })
  }
}

interface deleteOrderUpdateParams {
  videoId: string
  languageId: string
  transaction: Prisma.TransactionClient
}

export async function updateOrderDelete({
  videoId,
  languageId,
  transaction
}: deleteOrderUpdateParams): Promise<void> {
  const existing = await transaction.videoStudyQuestion.findMany({
    where: { videoId, languageId },
    select: { id: true },
    orderBy: { order: 'asc' }
  })

  let index = 1
  for (const studyQuestion of existing) {
    await transaction.videoStudyQuestion.update({
      where: { id: studyQuestion.id },
      data: { order: index }
    })
    index++
  }
}
