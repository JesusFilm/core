import { prisma } from '../../../lib/prisma'
import { builder } from '../../builder'
import { Language } from '../../language'

import { VideoSubtitleCreateInput } from './inputs/videoSubtitleCreate'
import { VideoSubtitleUpdateInput } from './inputs/videoSubtitleUpdate'

builder.prismaObject('VideoSubtitle', {
  fields: (t) => ({
    id: t.exposeID('id'),
    languageId: t.exposeID('languageId'),
    primary: t.exposeBoolean('primary'),
    edition: t.exposeString('edition'),
    vttSrc: t.exposeString('vttSrc', { nullable: true }),
    srtSrc: t.exposeString('srtSrc', { nullable: true }),
    value: t.string({
      resolve: ({ vttSrc, srtSrc }) => vttSrc ?? srtSrc ?? ''
    }),
    language: t.field({
      type: Language,
      resolve: ({ languageId: id }) => ({ id })
    }),
    videoEdition: t.relation('videoEdition')
  })
})

builder.mutationFields((t) => ({
  videoSubtitleCreate: t.withAuth({ isPublisher: true }).prismaField({
    type: 'VideoSubtitle',
    args: {
      input: t.arg({ type: VideoSubtitleCreateInput, required: true })
    },
    resolve: async (query, _parent, { input }) => {
      return await prisma.videoSubtitle.create({
        ...query,
        data: {
          ...input,
          id: input.id ?? undefined
        }
      })
    }
  }),
  videoSubtitleUpdate: t.withAuth({ isPublisher: true }).prismaField({
    type: 'VideoSubtitle',
    args: {
      input: t.arg({ type: VideoSubtitleUpdateInput, required: true })
    },
    resolve: async (query, _parent, { input }) => {
      return await prisma.videoSubtitle.update({
        ...query,
        where: { id: input.id },
        data: {
          edition: input.edition ?? undefined,
          vttSrc: input.vttSrc ?? undefined,
          srtSrc: input.srtSrc ?? undefined,
          primary: input.primary ?? undefined,
          languageId: input.languageId ?? undefined
        }
      })
    }
  }),
  videoSubtitleDelete: t.withAuth({ isPublisher: true }).prismaField({
    type: 'VideoSubtitle',
    args: {
      id: t.arg.id({ required: true })
    },
    resolve: async (query, _parent, { id }) => {
      return await prisma.videoSubtitle.delete({
        ...query,
        where: { id }
      })
    }
  })
}))
