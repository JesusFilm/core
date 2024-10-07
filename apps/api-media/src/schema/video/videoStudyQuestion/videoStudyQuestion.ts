import { Prisma } from '.prisma/api-media-client'

import { prisma } from '../../../lib/prisma'
import { builder } from '../../builder'
import { Language } from '../../language'

import { VideoStudyQuestionCreateInput } from './inputs/videoStudyQuestionCreate'
import { VideoStudyQuestionUpdateInput } from './inputs/videoStudyQuestionUpdate'

interface updateOrderDelete {
  videoId: string
  order?: number
  isDelete: true
  transaction: Prisma.TransactionClient
}

interface updateOrderUpdate {
  videoId: string
  order: number
  transaction: Prisma.TransactionClient
  isDelete?: false
}
type updateOrderParams = updateOrderDelete | updateOrderUpdate

export async function updateOrder({
  videoId,
  order = 0,
  transaction,
  isDelete = false
}: updateOrderParams): Promise<void> {
  const existing = await transaction.videoStudyQuestion.findMany({
    where: { videoId },
    select: { id: true },
    orderBy: { order: 'asc' }
  })

  if (isDelete) {
    let index = 1
    for (const studyQuestion of existing) {
      await transaction.videoStudyQuestion.update({
        where: { id: studyQuestion.id },
        data: { order: index }
      })
      index++
    }
    return
  }

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

builder.prismaObject('VideoStudyQuestion', {
  include: { order: true },
  fields: (t) => ({
    id: t.exposeID('id'),
    value: t.exposeString('value'),
    primary: t.exposeBoolean('primary'),
    language: t.field({
      type: Language,
      resolve: ({ languageId: id }) => ({ id })
    })
  })
})

builder.mutationFields((t) => ({
  createVideoStudyQuestion: t.prismaField({
    type: 'VideoStudyQuestion',
    args: {
      input: t.arg({ type: VideoStudyQuestionCreateInput, required: true })
    },
    authScopes: {
      isPublisher: true
    },
    resolve: async (_query, _parent, { input }) => {
      return await prisma.$transaction(async (transaction) => {
        await updateOrder({
          videoId: input.videoId,
          order: input.order,
          transaction
        })
        return await transaction.videoStudyQuestion.create({
          data: {
            ...input,
            id: input.id ?? undefined
          }
        })
      })
    }
  }),
  updateVideoStudyQuestion: t.prismaField({
    type: 'VideoStudyQuestion',
    args: {
      input: t.arg({ type: VideoStudyQuestionUpdateInput, required: true })
    },
    authScopes: {
      isPublisher: true
    },
    resolve: async (_query, _parent, { input }) => {
      const existing = await prisma.videoStudyQuestion.findUnique({
        where: { id: input.id },
        select: { videoId: true }
      })
      if (existing?.videoId == null)
        throw new Error(`videoStudyQuestion ${input.id} not found`)

      return await prisma.$transaction(async (transaction) => {
        if (input.order != null)
          await updateOrder({
            videoId: existing.videoId,
            order: input.order,
            transaction
          })
        return await transaction.videoStudyQuestion.update({
          where: { id: input.id },
          data: {
            value: input.value ?? undefined,
            primary: input.primary ?? undefined,
            languageId: input.languageId ?? undefined,
            crowdInId: input.crowdInId ?? undefined,
            order: input.order ?? undefined
          }
        })
      })
    }
  }),
  deleteVideoStudyQuestion: t.prismaField({
    type: 'VideoStudyQuestion',
    args: {
      id: t.arg.id({ required: true })
    },
    authScopes: {
      isPublisher: true
    },
    resolve: async (_query, _parent, { id }) => {
      return await prisma.$transaction(async (transaction) => {
        const existing = await transaction.videoStudyQuestion.findUnique({
          where: { id }
        })
        if (existing == null)
          throw new Error(`videoStudyQuestion ${id} not found`)

        await transaction.videoStudyQuestion.delete({
          where: { id }
        })
        await updateOrder({
          videoId: existing.id,
          isDelete: true,
          transaction
        })
        return existing
      })
    }
  })
}))
