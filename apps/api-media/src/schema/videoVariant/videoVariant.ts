import compact from 'lodash/compact'

import { VideoVariantDownloadQuality as PrismaVideoVariantDownloadQuality } from '.prisma/api-media-client'

import { prisma } from '../../lib/prisma'
import { builder } from '../builder'
import { Language } from '../language'

const VideoVariantDownloadQuality = builder.enumType(
  PrismaVideoVariantDownloadQuality,
  {
    name: 'VideoVariantDownloadQuality'
  }
)

builder.prismaObject('VideoVariantDownload', {
  fields: (t) => ({
    id: t.exposeID('id'),
    quality: t.field({
      type: VideoVariantDownloadQuality,
      resolve: ({ quality }) => quality
    }),
    size: t.float({ resolve: ({ size }) => size ?? 0 }),
    height: t.int({ resolve: ({ height }) => height ?? 0 }),
    width: t.int({ resolve: ({ width }) => width ?? 0 }),
    url: t.exposeString('url')
  })
})

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
