import { prisma } from '@core/prisma/media/client'

import { builder } from '../../builder'
import { Language } from '../../language'

import { VideoSubtitleCreateInput } from './inputs/videoSubtitleCreate'
import { VideoSubtitleUpdateInput } from './inputs/videoSubtitleUpdate'

builder.prismaObject('VideoSubtitle', {
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    languageId: t.exposeID('languageId', { nullable: false }),
    primary: t.exposeBoolean('primary', { nullable: false }),
    edition: t.exposeString('edition', { nullable: false }),
    vttAsset: t
      .withAuth({ isPublisher: true })
      .relation('vttAsset', { nullable: true, description: 'subtitle file' }),
    vttSrc: t.exposeString('vttSrc'),
    vttVersion: t.withAuth({ isPublisher: true }).exposeInt('vttVersion', {
      nullable: false,
      description: 'version control for subtitle file'
    }),
    srtAsset: t
      .withAuth({ isPublisher: true })
      .relation('srtAsset', { nullable: true, description: 'subtitle file' }),
    srtSrc: t.exposeString('srtSrc'),
    srtVersion: t.withAuth({ isPublisher: true }).exposeInt('srtVersion', {
      nullable: false,
      description: 'version control for subtitle file'
    }),
    value: t.string({
      nullable: false,
      resolve: ({ vttSrc, srtSrc }) => vttSrc ?? srtSrc ?? ''
    }),
    language: t.field({
      type: Language,
      nullable: false,
      resolve: ({ languageId: id }) => ({ id })
    }),
    videoEdition: t.relation('videoEdition', { nullable: false })
  })
})

builder.mutationFields((t) => ({
  videoSubtitleCreate: t.withAuth({ isPublisher: true }).prismaField({
    type: 'VideoSubtitle',
    nullable: false,
    args: {
      input: t.arg({ type: VideoSubtitleCreateInput, required: true })
    },
    resolve: async (query, _parent, { input }) => {
      return await prisma.videoSubtitle.create({
        ...query,
        data: {
          ...input,
          id: input.id ?? undefined,
          vttVersion: input.vttVersion ?? undefined,
          srtVersion: input.srtVersion ?? undefined
        }
      })
    }
  }),
  videoSubtitleUpdate: t.withAuth({ isPublisher: true }).prismaField({
    type: 'VideoSubtitle',
    nullable: false,
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
          vttAssetId: input.vttAssetId ?? undefined,
          vttVersion: input.vttVersion ?? undefined,
          srtSrc: input.srtSrc ?? undefined,
          srtAssetId: input.srtAssetId ?? undefined,
          srtVersion: input.srtVersion ?? undefined,
          primary: input.primary ?? undefined,
          languageId: input.languageId ?? undefined
        }
      })
    }
  }),
  videoSubtitleDelete: t.withAuth({ isPublisher: true }).prismaField({
    type: 'VideoSubtitle',
    nullable: false,
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
