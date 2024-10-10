import { Prisma } from '.prisma/api-media-client'

interface updateOrderUpdateParams {
  videoId: string
  id: string
  order: number
  transaction: Prisma.TransactionClient
}
export async function updateOrderUpdate({
  videoId,
  id,
  order,
  transaction
}: updateOrderUpdateParams): Promise<void> {
  const existing = await transaction.videoStudyQuestion.findMany({
    where: { videoId },
    select: { id: true },
    orderBy: { order: 'asc' }
  })

  const newOrders = existing.map((item, index) => ({
    id: item.id,
    order: index >= order - 1 ? index + 2 : index + 1
  }))

  let index = 0
  for (const studyQuestion of newOrders) {
    index++
    if (studyQuestion.id === id) continue
    await transaction.videoStudyQuestion.update({
      where: { id: studyQuestion.id },
      data: { order: index }
    })
  }
}

interface createOrderUpdateParams {
  videoId: string
  order: number
  transaction: Prisma.TransactionClient
}

export async function updateOrderCreate({
  videoId,
  order = 0,
  transaction
}: createOrderUpdateParams): Promise<void> {
  const existing = await transaction.videoStudyQuestion.findMany({
    where: { videoId },
    select: { id: true },
    orderBy: { order: 'asc' }
  })

  const newOrders = existing.map((item, index) => ({
    id: item.id,
    order: index >= order - 1 ? index + 2 : index + 1
  }))

  for (const studyQuestion of newOrders) {
    await transaction.videoStudyQuestion.update({
      where: { id: studyQuestion.id },
      data: { order: studyQuestion.order }
    })
  }
}

interface deleteOrderUpdateParams {
  videoId: string
  transaction: Prisma.TransactionClient
}

export async function updateOrderDelete({
  videoId,
  transaction
}: deleteOrderUpdateParams): Promise<void> {
  const existing = await transaction.videoStudyQuestion.findMany({
    where: { videoId },
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
