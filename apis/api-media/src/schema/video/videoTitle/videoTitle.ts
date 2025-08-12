import {
  exportVideoTitleToCrowdin,
  updateVideoTitleInCrowdin
} from '../../../lib/crowdin/videoTitle'
import { prisma } from '../../../lib/prisma'
import { logger } from '../../../logger'
import { builder } from '../../builder'
import { Language } from '../../language'
import { VideoTranslationCreateInput } from '../inputs/videoTranslationCreate'
import { VideoTranslationUpdateInput } from '../inputs/videoTranslationUpdate'

builder.prismaObject('VideoTitle', {
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    value: t.exposeString('value', { nullable: false }),
    primary: t.exposeBoolean('primary', { nullable: false }),
    language: t.field({
      type: Language,
      nullable: false,
      resolve: ({ languageId: id }) => ({ id })
    }),
    crowdInId: t.exposeString('crowdInId')
  })
})

builder.mutationFields((t) => ({
  videoTitleCreate: t.withAuth({ isPublisher: true }).prismaField({
    type: 'VideoTitle',
    nullable: false,
    args: {
      input: t.arg({ type: VideoTranslationCreateInput, required: true })
    },
    resolve: async (query, _parent, { input }) => {
      return await prisma.$transaction(async (tx) => {
        const videoTitle = await tx.videoTitle.create({
          ...query,
          data: {
            ...input,
            id: input.id ?? undefined
          }
        })

        if (videoTitle.videoId != null) {
          try {
            const crowdInId = await exportVideoTitleToCrowdin(
              videoTitle.videoId,
              videoTitle.value
            )

            return await tx.videoTitle.update({
              ...query,
              where: { id: videoTitle.id },
              data: { crowdInId: crowdInId ?? undefined }
            })
          } catch (error) {
            logger?.error('Crowdin export error:', error)
            return videoTitle
          }
        }

        return videoTitle
      })
    }
  }),
  videoTitleUpdate: t.withAuth({ isPublisher: true }).prismaField({
    type: 'VideoTitle',
    nullable: false,
    args: {
      input: t.arg({ type: VideoTranslationUpdateInput, required: true })
    },
    resolve: async (query, _parent, { input }) => {
      return await prisma.$transaction(
        async (transaction) => {
          const existing = await transaction.videoTitle.findUnique({
            where: { id: input.id },
            select: { videoId: true, crowdInId: true }
          })
          if (existing == null)
            throw new Error(`videoTitle ${input.id} not found`)

          if (existing.videoId == null)
            throw new Error(`videoTitle ${input.id} videoId not found`)

          const updatedRecord = await transaction.videoTitle.update({
            ...query,
            where: { id: input.id },
            data: {
              value: input.value ?? undefined,
              primary: input.primary ?? undefined,
              languageId: input.languageId ?? undefined
            }
          })

          try {
            await updateVideoTitleInCrowdin(
              existing.videoId,
              input.value ?? '',
              existing.crowdInId ?? null
            )
          } catch (error) {
            logger?.error('Crowdin export error:', error)
          }

          return updatedRecord
        },
        {
          timeout: 10000
        }
      )
    }
  }),
  videoTitleDelete: t.withAuth({ isPublisher: true }).prismaField({
    type: 'VideoTitle',
    nullable: false,
    args: {
      id: t.arg.id({ required: true })
    },
    resolve: async (query, _parent, { id }) => {
      return await prisma.videoTitle.delete({
        ...query,
        where: { id }
      })
    }
  })
}))
