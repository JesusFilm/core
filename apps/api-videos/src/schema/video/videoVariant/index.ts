import { builder } from '../../builder'
import { Language } from '../language'
import { VideoVariantSubtitle } from './videoVariantSubtitle'
import { Prisma } from '.prisma/api-videos-client'
import { prisma } from '../../../lib/prisma'

import './videoVariantDownload'

export const VideoVariant = builder.prismaObject('VideoVariant', {
  fields: (t) => ({
    id: t.exposeID('id'),
    hls: t.exposeString('hls', { nullable: true }),
    downloads: t.relation('downloads'),
    slug: t.exposeString('slug'),
    duration: t.field({
      type: 'Int',
      resolve: (parent) => parent.duration ?? 0
    }),
    language: t.field({
      type: Language,
      resolve: (parent) => ({ id: parent.languageId })
    }),
    subtitle: t.prismaField({
      type: [VideoVariantSubtitle],
      args: {
        languageId: t.arg.id({ required: false }),
        primary: t.arg.boolean({ required: false })
      },
      resolve: async (query, parent, { languageId, primary }) => {
        const where: Prisma.VideoVariantSubtitleWhereInput = {
          videoVariantId: parent.id,
          OR: languageId == null && primary == null ? undefined : []
        }
        if (languageId != null) where.OR?.push({ languageId })
        if (primary != null) where.OR?.push({ primary })
        return await prisma.videoVariantSubtitle.findMany({
          ...query,
          where,
          orderBy: { primary: 'desc' }
        })
      }
    }),
    subtitleCount: t.field({
      type: 'Int',
      resolve: (parent) =>
        prisma.videoVariantSubtitle.count({
          where: { videoVariantId: parent.id }
        })
    })
  })
})
