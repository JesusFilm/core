import {
  exportVideoDescriptionToCrowdin,
  updateVideoDescriptionInCrowdin
} from '../../../lib/crowdin/videoDescription'
import { prisma } from '../../../lib/prisma'
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
      const newVideoDescription = await prisma.videoDescription.create({
        ...query,
        data: {
          ...input,
          id: input.id ?? undefined
        }
      })
      if (newVideoDescription.videoId != null) {
        const crowdInId = await exportVideoDescriptionToCrowdin(
          newVideoDescription.videoId,
          newVideoDescription.value
        )
        await prisma.videoDescription.update({
          where: { id: newVideoDescription.id },
          data: { crowdInId: crowdInId ?? undefined }
        })
      }
      return newVideoDescription
    }
  }),
  videoDescriptionUpdate: t.withAuth({ isPublisher: true }).prismaField({
    type: 'VideoDescription',
    nullable: false,
    args: {
      input: t.arg({ type: VideoTranslationUpdateInput, required: true })
    },
    resolve: async (query, _parent, { input }) => {
      const updatedVideoDescription = await prisma.videoDescription.update({
        ...query,
        where: { id: input.id },
        data: {
          value: input.value ?? undefined,
          primary: input.primary ?? undefined,
          languageId: input.languageId ?? undefined
        }
      })
      if (updatedVideoDescription.videoId != null) {
        await updateVideoDescriptionInCrowdin(
          updatedVideoDescription.videoId,
          updatedVideoDescription.value,
          updatedVideoDescription.crowdInId
        )
      }
      return updatedVideoDescription
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
