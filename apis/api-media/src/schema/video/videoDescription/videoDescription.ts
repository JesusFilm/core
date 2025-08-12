import {
  exportVideoDescriptionToCrowdin,
  updateVideoDescriptionInCrowdin
} from '../../../lib/crowdin/videoDescription'
import { prisma } from '../../../lib/prisma'
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
      return await prisma.$transaction(async (tx) => {
        const newVideoDescription = await tx.videoDescription.create({
          ...query,
          data: {
            ...input,
            id: input.id ?? undefined
          }
        })

        if (newVideoDescription.videoId != null) {
          try {
            const crowdInId = await exportVideoDescriptionToCrowdin(
              newVideoDescription.videoId,
              newVideoDescription.value
            )

            if (crowdInId != null) {
              return await tx.videoDescription.update({
                ...query,
                where: { id: newVideoDescription.id },
                data: { crowdInId: crowdInId ?? undefined }
              })
            }
          } catch (error) {
            logger?.error('Crowdin export error:', error)
            return newVideoDescription
          }
        }

        return newVideoDescription
      })
    }
  }),
  videoDescriptionUpdate: t.withAuth({ isPublisher: true }).prismaField({
    type: 'VideoDescription',
    nullable: false,
    args: {
      input: t.arg({ type: VideoTranslationUpdateInput, required: true })
    },
    resolve: async (query, _parent, { input }) => {
      return await prisma.$transaction(
        async (transaction) => {
          const existing = await transaction.videoDescription.findUnique({
            where: { id: input.id },
            select: { videoId: true, crowdInId: true }
          })
          if (existing == null)
            throw new Error(`videoDescription ${input.id} not found`)

          if (existing.videoId == null)
            throw new Error(`videoDescription ${input.id} videoId not found`)

          const updatedRecord = await transaction.videoDescription.update({
            ...query,
            where: { id: input.id },
            data: {
              value: input.value ?? undefined,
              primary: input.primary ?? undefined,
              languageId: input.languageId ?? undefined
            }
          })

          if (input.value != null) {
            await updateVideoDescriptionInCrowdin(
              existing.videoId,
              updatedRecord.value,
              existing.crowdInId ?? null
            )
          }

          return updatedRecord
        },
        {
          timeout: 10000
        }
      )
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
