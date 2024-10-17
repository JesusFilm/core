import sortBy from 'lodash/sortBy'

import { Prisma } from '.prisma/api-media-client'

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
  const existing = await transaction.videoStudyQuestion.findMany({
    where: { videoId, languageId },
    select: { id: true, order: true },
    orderBy: { order: 'asc' }
  })

  const newOrders = sortBy(
    existing.map((item, index) => ({
      id: item.id,
      order:
        item.id === id ? order : index >= order - 1 ? index + 2 : index + 1,
      originalOrder: item.order
    })),
    'order'
  )

  let existingOrders = newOrders.map((item) => item.originalOrder)
  const deferred: string[] = []

  for (let index = 1; index <= newOrders.length; index++) {
    if (order > index) continue
    const studyQuestion = newOrders[index - 1]
    if (
      !deferred.includes(studyQuestion.id) &&
      existingOrders.includes(index)
    ) {
      await transaction.videoStudyQuestion.update({
        where: {
          videoId_languageId_order: { videoId, languageId, order: index }
        },
        data: { order: index + 1000 }
      })
      existingOrders = existingOrders.filter(
        (item) => item !== studyQuestion.originalOrder
      )
    }
    await transaction.videoStudyQuestion.update({
      where: { id: studyQuestion.id },
      data: { order: studyQuestion.order }
    })
    deferred.push(studyQuestion.id)
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

  const newOrders = sortBy(
    existing.map((item, index) => ({
      id: item.id,
      order: index >= order - 1 ? index + 2 : index + 1,
      originalOrder: item.order
    })),
    'order'
  )

  let existingOrders = newOrders.map((item) => item.originalOrder)
  const deferred: string[] = []

  for (let index = 1; index <= newOrders.length; index++) {
    if (order > index) continue
    const studyQuestion = newOrders[index - 1]
    if (
      !deferred.includes(studyQuestion.id) &&
      existingOrders.includes(index)
    ) {
      await transaction.videoStudyQuestion.update({
        where: {
          videoId_languageId_order: { videoId, languageId, order: index }
        },
        data: { order: index + 1000 }
      })
      existingOrders = existingOrders.filter(
        (item) => item !== studyQuestion.originalOrder
      )
    }
    await transaction.videoStudyQuestion.update({
      where: { id: studyQuestion.id },
      data: { order: studyQuestion.order }
    })
    deferred.push(studyQuestion.id)
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
