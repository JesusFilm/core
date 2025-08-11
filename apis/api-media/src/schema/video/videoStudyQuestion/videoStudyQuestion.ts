import {
  exportStudyQuestionToCrowdin,
  updateStudyQuestionInCrowdin
} from '../../../lib/crowdin/videoStudyQuestion'
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
    id: t.exposeID('id', { nullable: false }),
    value: t.exposeString('value', { nullable: false }),
    primary: t.exposeBoolean('primary', { nullable: false }),
    order: t.exposeInt('order', { nullable: false }),
    language: t.field({
      type: Language,
      nullable: false,
      resolve: ({ languageId: id }) => ({ id })
    }),
    crowdInId: t.exposeString('crowdInId')
  })
})

builder.mutationFields((t) => ({
  videoStudyQuestionCreate: t.withAuth({ isPublisher: true }).prismaField({
    type: 'VideoStudyQuestion',
    nullable: false,
    args: {
      input: t.arg({ type: VideoStudyQuestionCreateInput, required: true })
    },
    resolve: async (query, _parent, { input }) => {
      return await prisma.$transaction(async (transaction) => {
        await updateOrderCreate({
          videoId: input.videoId,
          languageId: input.languageId,
          order: input.order,
          transaction
        })

        const newVideoStudyQuestion =
          await transaction.videoStudyQuestion.create({
            ...query,
            data: {
              ...input,
              id: input.id ?? undefined
            }
          })
        if (newVideoStudyQuestion.videoId != null) {
          await exportStudyQuestionToCrowdin(
            newVideoStudyQuestion.videoId,
            newVideoStudyQuestion.value,
            newVideoStudyQuestion.order
          )
        }
        return newVideoStudyQuestion
      })
    }
  }),
  videoStudyQuestionUpdate: t.withAuth({ isPublisher: true }).prismaField({
    type: 'VideoStudyQuestion',
    nullable: false,
    args: {
      input: t.arg({ type: VideoStudyQuestionUpdateInput, required: true })
    },
    resolve: async (query, _parent, { input }) => {
      return await prisma.$transaction(
        async (transaction) => {
          const existing = await transaction.videoStudyQuestion.findUnique({
            where: { id: input.id },
            select: { videoId: true, languageId: true }
          })
          if (existing == null)
            throw new Error(`videoStudyQuestion ${input.id} not found`)

          if (existing.videoId == null)
            throw new Error(`videoStudyQuestion ${input.id} videoId not found`)

          if (input.order != null)
            await updateOrderUpdate({
              videoId: existing.videoId,
              id: input.id,
              languageId: existing.languageId,
              order: input.order,
              transaction
            })

          await updateStudyQuestionInCrowdin(
            existing.videoId,
            input.value ?? '',
            input.crowdInId ?? null
          )

          return await transaction.videoStudyQuestion.update({
            ...query,
            where: { id: input.id },
            data: {
              value: input.value ?? undefined,
              primary: input.primary ?? undefined,
              crowdInId: input.crowdInId ?? undefined
            }
          })
        },
        {
          timeout: 10000
        }
      )
    }
  }),
  videoStudyQuestionDelete: t.withAuth({ isPublisher: true }).prismaField({
    type: 'VideoStudyQuestion',
    nullable: false,
    args: {
      id: t.arg.id({ required: true })
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
          languageId: existing.languageId,
          transaction
        })
        return existing
      })
    }
  })
}))
