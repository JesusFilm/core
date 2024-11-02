import compact from 'lodash/compact'

import { prisma } from '../../lib/prisma'
import { builder } from '../builder'
import { Language } from '../language'

import { VideoVariantCreateInput } from './inputs/videoVariantCreate'
import { VideoVariantUpdateInput } from './inputs/videoVariantUpdate'

builder.prismaObject('VideoVariant', {
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    hls: t.exposeString('hls'),
    dash: t.exposeString('dash'),
    share: t.exposeString('share'),
    downloads: t.relation('downloads', { nullable: false }),
    duration: t.int({
      nullable: false,
      resolve: ({ duration }) => duration ?? 0
    }),
    language: t.field({
      type: Language,
      nullable: false,
      resolve: ({ languageId: id }) => ({ id })
    }),
    videoEdition: t.relation('videoEdition', { nullable: false }),
    subtitle: t.prismaField({
      type: ['VideoSubtitle'],
      nullable: false,
      args: {
        languageId: t.arg.id({ required: false }),
        primary: t.arg.boolean({ required: false })
      },
      resolve: async (query, parent, { languageId, primary }) => {
        if (parent.videoId == null) return []
        return await prisma.videoSubtitle.findMany({
          ...query,
          where: {
            AND: [
              { videoId: parent.videoId, edition: parent.edition },
              {
                OR: compact([
                  primary != null ? { primary } : undefined,
                  languageId != null ? { languageId } : undefined
                ])
              }
            ]
          },
          orderBy: { primary: 'desc' }
        })
      }
    }),
    subtitleCount: t.int({
      nullable: false,
      resolve: async (parent) => {
        if (parent.videoId == null) return 0
        return await prisma.videoSubtitle.count({
          where: { videoId: parent.videoId, edition: parent.edition }
        })
      }
    }),
    slug: t.exposeString('slug', {
      nullable: false,
      description: 'slug is a permanent link to the video variant.'
    })
  })
})

builder.queryFields((t) => ({
  videoVariants: t.prismaField({
    type: ['VideoVariant'],
    nullable: false,
    resolve: async (query) =>
      await prisma.videoVariant.findMany({
        ...query
      })
  })
}))

builder.mutationFields((t) => ({
  videoVariantCreate: t.withAuth({ isPublisher: true }).prismaField({
    type: 'VideoVariant',
    nullable: false,
    args: {
      input: t.arg({ type: VideoVariantCreateInput, required: true })
    },
    resolve: async (query, _parent, { input }) => {
      return await prisma.videoVariant.create({
        ...query,
        data: input
      })
    }
  }),
  videoVariantUpdate: t.withAuth({ isPublisher: true }).prismaField({
    type: 'VideoVariant',
    nullable: false,
    args: {
      input: t.arg({ type: VideoVariantUpdateInput, required: true })
    },
    resolve: async (query, _parent, { input }) => {
      return await prisma.videoVariant.update({
        ...query,
        where: { id: input.id },
        data: {
          hls: input.hls ?? undefined,
          dash: input.dash ?? undefined,
          share: input.share ?? undefined,
          duration: input.duration ?? undefined,
          languageId: input.languageId ?? undefined,
          slug: input.slug ?? undefined,
          videoId: input.videoId ?? undefined,
          edition: input.edition ?? undefined
        }
      })
    }
  }),
  videoVariantDelete: t.withAuth({ isPublisher: true }).prismaField({
    type: 'VideoVariant',
    nullable: false,
    args: {
      id: t.arg.id({ required: true })
    },
    resolve: async (query, _parent, { id }) => {
      return await prisma.videoVariant.delete({
        ...query,
        where: { id }
      })
    }
  })
}))
