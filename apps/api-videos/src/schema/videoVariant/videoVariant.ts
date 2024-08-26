import compact from 'lodash/compact'

import { VideoVariantDownloadQuality as PrismaVideoVariantDownloadQuality } from '.prisma/api-videos-client'

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
    url: t.exposeString('url')
  })
})

builder.prismaObject('VideoVariantSubtitle', {
  fields: (t) => ({
    id: t.exposeID('id'),
    value: t.exposeString('value'),
    primary: t.exposeBoolean('primary'),
    language: t.field({
      type: Language,
      resolve: ({ languageId: id }) => ({ id })
    })
  })
})

builder.prismaObject('VideoVariant', {
  fields: (t) => ({
    id: t.exposeID('id'),
    hls: t.exposeString('hls', { nullable: true }),
    downloads: t.relation('downloads'),
    duration: t.int({ resolve: ({ duration }) => duration ?? 0 }),
    language: t.field({
      type: Language,
      resolve: ({ languageId: id }) => ({ id })
    }),
    subtitle: t.relation('subtitle', {
      args: {
        languageId: t.arg.id({ required: false }),
        primary: t.arg.boolean({ required: false })
      },
      query: ({ languageId, primary }) => ({
        where: {
          OR: compact([
            primary != null ? { primary } : undefined,
            { languageId: languageId ?? '529' }
          ])
        },
        orderBy: { primary: 'desc' },
        include: { language: true }
      })
    }),
    subtitleCount: t.int({
      resolve: async ({ id: videoVariantId }) =>
        await prisma.videoVariantSubtitle.count({ where: { videoVariantId } })
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
