import {
  exportVideoTitleToCrowdin,
  updateVideoTitleInCrowdin
} from '../../../lib/crowdin/videoTitle'
import { prisma } from '../../../lib/prisma'
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
      let crowdInId: string | null = null
      try {
        crowdInId = await exportVideoTitleToCrowdin(input.videoId, input.value)
      } catch (error) {
        console.error('Crowdin export error:', error)
      }

      const videoTitle = await prisma.videoTitle.create({
        ...query,
        data: {
          ...input,
          id: input.id ?? undefined,
          crowdInId: crowdInId ?? undefined
        }
      })

      return videoTitle
    }
  }),
  videoTitleUpdate: t.withAuth({ isPublisher: true }).prismaField({
    type: 'VideoTitle',
    nullable: false,
    args: {
      input: t.arg({ type: VideoTranslationUpdateInput, required: true })
    },
    resolve: async (query, _parent, { input }) => {
      const videoTitle = await prisma.videoTitle.update({
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
          videoTitle.videoId,
          videoTitle.value,
          videoTitle.crowdInId ?? null
        )
      } catch (error) {
        console.error('Crowdin export error:', error)
      }

      return videoTitle
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
