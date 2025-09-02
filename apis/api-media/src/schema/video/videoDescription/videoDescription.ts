import { prisma } from '@core/prisma/media/client'

import { syncWithCrowdin } from '../../../lib/crowdin/crowdinSync'
import { logger } from '../../../logger'
import { builder } from '../../builder'
import { Language } from '../../language'
import { VideoTranslationCreateInput } from '../inputs/videoTranslationCreate'
import { VideoTranslationUpdateInput } from '../inputs/videoTranslationUpdate'

builder.prismaObject('VideoDescription', {
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
  videoDescriptionCreate: t.withAuth({ isPublisher: true }).prismaField({
    type: 'VideoDescription',
    nullable: false,
    args: {
      input: t.arg({ type: VideoTranslationCreateInput, required: true })
    },
    resolve: async (query, _parent, { input }) => {
      let crowdInId: string | null = null
      try {
        crowdInId = await syncWithCrowdin(
          'videoDescription',
          input.videoId,
          input.value,
          `Description for videoId: ${input.videoId}`,
          null,
          logger
        )
      } catch (error) {
        logger?.error('Crowdin export error:', error)
      }

      const videoDescription = await prisma.videoDescription.create({
        ...query,
        data: {
          ...input,
          id: input.id ?? undefined,
          crowdInId: crowdInId ?? undefined
        }
      })

      return videoDescription
    }
  }),

  videoDescriptionUpdate: t.withAuth({ isPublisher: true }).prismaField({
    type: 'VideoDescription',
    nullable: false,
    args: {
      input: t.arg({ type: VideoTranslationUpdateInput, required: true })
    },
    resolve: async (query, _parent, { input }) => {
      const existing = await prisma.videoDescription.findUnique({
        where: { id: input.id },
        select: { videoId: true, crowdInId: true }
      })
      if (existing == null)
        throw new Error(`videoDescription ${input.id} not found`)

      if (existing.videoId == null)
        throw new Error(`videoDescription ${input.id} videoId not found`)

      const updatedRecord = await prisma.videoDescription.update({
        ...query,
        where: { id: input.id },
        data: {
          value: input.value ?? undefined,
          primary: input.primary ?? undefined,
          languageId: input.languageId ?? undefined
        }
      })

      try {
        const crowdInId = await syncWithCrowdin(
          'videoDescription',
          existing.videoId,
          input.value ?? '',
          `Description for videoId: ${existing.videoId}`,
          existing.crowdInId ?? null,
          logger
        )

        if (crowdInId && crowdInId !== existing.crowdInId) {
          return await prisma.videoDescription.update({
            ...query,
            where: { id: input.id },
            data: { crowdInId }
          })
        }
      } catch (error) {
        logger?.error('Crowdin export error:', error)
      }

      return updatedRecord
    }
  }),
  videoDescriptionDelete: t.withAuth({ isPublisher: true }).prismaField({
    type: 'VideoDescription',
    nullable: false,
    args: {
      id: t.arg.id({ required: true })
    },
    resolve: async (query, _parent, { id }) => {
      return await prisma.videoDescription.delete({
        ...query,
        where: { id }
      })
    }
  })
}))
