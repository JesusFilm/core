import { prisma } from '../../../lib/prisma'
import { builder } from '../../builder'
import { Language } from '../../language'

import { VideoStudyQuestionCreateInput } from './inputs/videoStudyQuestionCreate'
import { VideoStudyQuestionUpdateInput } from './inputs/videoStudyQuestionUpdate'
import {
  updateOrderCreate,
  updateOrderDelete,
  updateOrderUpdate
} from './updateOrder'

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
        await updateOrderCreate({
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
      return await prisma.$transaction(async (transaction) => {
        const existing = await transaction.videoStudyQuestion.findUnique({
          where: { id: input.id },
          select: { videoId: true }
        })
        if (existing == null)
          throw new Error(`videoStudyQuestion ${input.id} not found`)

        if (existing.videoId == null)
          throw new Error(`videoStudyQuestion ${input.id} videoId not found`)

        if (input.order != null)
          await updateOrderUpdate({
            videoId: existing.videoId,
            id: input.id,
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
    resolve: async (query, _parent, { id }) => {
      const existing = await prisma.videoStudyQuestion.findUnique({
        ...query,
        where: { id }
      })
      return await prisma.$transaction(async (transaction) => {
        if (existing == null)
          throw new Error(`videoStudyQuestion ${id} not found`)

        await transaction.videoStudyQuestion.delete({
          where: { id }
        })
        await updateOrderDelete({
          videoId: existing.id,
          transaction
        })
        return existing
      })
    }
  })
}))
