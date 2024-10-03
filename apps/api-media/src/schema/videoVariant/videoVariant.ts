import compact from 'lodash/compact'

import { prisma } from '../../lib/prisma'
import { builder } from '../builder'
import { Language } from '../language'

import { VideoVariantCreateInput } from './inputs/videoVariantCreate'
import { VideoVariantUpdateInput } from './inputs/videoVariantUpdate'

builder.prismaObject('VideoVariant', {
  fields: (t) => ({
    id: t.exposeID('id'),
    hls: t.exposeString('hls', { nullable: true }),
    dash: t.exposeString('dash', { nullable: true }),
    share: t.exposeString('share', { nullable: true }),
    downloads: t.relation('downloads'),
    duration: t.int({ resolve: ({ duration }) => duration ?? 0 }),
    language: t.field({
      type: Language,
      resolve: ({ languageId: id }) => ({ id })
    }),
    subtitle: t.prismaField({
      type: ['VideoSubtitle'],
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
      resolve: async (parent) => {
        if (parent.videoId == null) return 0
        return await prisma.videoSubtitle.count({
          where: { videoId: parent.videoId, edition: parent.edition }
        })
      }
    }),
    slug: t.exposeString('slug', {
      description: 'slug is a permanent link to the video variant.'
    })
  })
})

builder.queryFields((t) => ({
  videoVariants: t.prismaField({
    type: ['VideoVariant'],
    resolve: async (query) =>
      await prisma.videoVariant.findMany({
        ...query
      })
  })
}))

builder.mutationFields((t) => ({
  createVideoVariant: t.prismaField({
    type: 'VideoVariant',
    args: {
      input: t.arg({ type: VideoVariantCreateInput, required: true })
    },
    authScopes: {
      isPublisher: true
    },
    resolve: async (_query, _parent, { input }) => {
      return await prisma.videoVariant.create({
        data: input
      })
    }
  }),
  updateVideoVariant: t.prismaField({
    type: 'VideoVariant',
    args: {
      input: t.arg({ type: VideoVariantUpdateInput, required: true })
    },
    authScopes: {
      isPublisher: true
    },
    resolve: async (_query, _parent, { input }) => {
      return await prisma.videoVariant.update({
        where: { id: input.id },
        data: {
          hls: input.hls ?? undefined,
          dash: input.dash ?? undefined,
          share: input.share ?? undefined,
          duration: input.duration ?? undefined,
          languageId: input.languageId ?? undefined,
          slug: input.slug ?? undefined,
          videoId: input.videoId ?? undefined
        }
      })
    }
  }),
  deleteVideoVariant: t.prismaField({
    type: 'VideoVariant',
    args: {
      id: t.arg.id({ required: true })
    },
    authScopes: {
      isPublisher: true
    },
    resolve: async (_query, _parent, { id }) => {
      return await prisma.videoVariant.delete({
        where: { id }
      })
    }
  })
}))
