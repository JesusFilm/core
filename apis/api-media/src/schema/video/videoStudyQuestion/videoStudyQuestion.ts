import { syncWithCrowdin } from '../../../lib/crowdin/crowdinSync'
import { prisma } from '../../../lib/prisma'
import { logger } from '../../../logger'
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
      let crowdInId: string | null = null
      try {
        crowdInId = await syncWithCrowdin(
          'videoStudyQuestion',
          `${input.videoId}_${input.order}`,
          input.value,
          `Study question ${input.order} for videoId: ${input.videoId}`,
          null,
          logger
        )
      } catch (error) {
        logger?.error('Crowdin export error:', error)
      }

      const created = await prisma.$transaction(
        async (transaction) => {
          await updateOrderCreate({
            videoId: input.videoId,
            languageId: input.languageId,
            order: input.order,
            transaction
          })

          return await transaction.videoStudyQuestion.create({
            ...query,
            data: {
              ...input,
              id: input.id ?? undefined,
              crowdInId: crowdInId ?? undefined
            }
          })
        },
        {
          timeout: 10000
        }
      )

      return created
    }
  }),
  videoStudyQuestionUpdate: t.withAuth({ isPublisher: true }).prismaField({
    type: 'VideoStudyQuestion',
    nullable: false,
    args: {
      input: t.arg({ type: VideoStudyQuestionUpdateInput, required: true })
    },
    resolve: async (query, _parent, { input }) => {
      const result = await prisma.$transaction(
        async (transaction) => {
          const existing = await transaction.videoStudyQuestion.findUnique({
            where: { id: input.id },
            select: {
              videoId: true,
              languageId: true,
              crowdInId: true,
              order: true
            }
          })
          if (existing == null)
            throw new Error(`videoStudyQuestion ${input.id} not found`)

          if (input.order != null) {
            await updateOrderUpdate({
              videoId: existing.videoId,
              id: input.id,
              languageId: existing.languageId,
              order: input.order,
              transaction
            })
          }

          return await transaction.videoStudyQuestion.update({
            ...query,
            where: { id: input.id },
            data: {
              value: input.value ?? undefined,
              primary: input.primary ?? undefined
            }
          })
        },
        {
          timeout: 10000
        }
      )

      try {
        const crowdInId = await syncWithCrowdin(
          'videoStudyQuestion',
          `${result.videoId}_${result.order}`,
          input.value ?? '',
          `Study question ${result.order} for videoId: ${result.videoId}`,
          result.crowdInId ?? null,
          logger
        )

        if (crowdInId && crowdInId !== result.crowdInId) {
          return await prisma.videoStudyQuestion.update({
            ...query,
            where: { id: input.id },
            data: { crowdInId }
          })
        }
      } catch (error) {
        logger?.error('Crowdin export error:', error)
      }

      return result
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
