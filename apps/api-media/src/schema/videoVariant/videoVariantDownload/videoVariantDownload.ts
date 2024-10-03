import { prisma } from '../../../lib/prisma'
import { builder } from '../../builder'

import { VideoVariantDownloadQuality } from './enums/videoVariantDownloadQuality'
import { VideoVariantDownloadCreateInput } from './inputs/videoVariantDownloadCreate'
import { VideoVariantDownloadUpdateInput } from './inputs/videoVariantDownloadUpdate'

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

builder.mutationFields((t) => ({
  createVideoVariantDownload: t.prismaField({
    type: 'VideoVariantDownload',
    args: {
      input: t.arg({ type: VideoVariantDownloadCreateInput, required: true })
    },
    authScopes: {
      isPublisher: true
    },
    resolve: async (_query, _parent, { input }) => {
      return await prisma.videoVariantDownload.create({
        data: {
          ...input,
          id: input.id ?? undefined
        }
      })
    }
  }),
  updateVideoVariantDownload: t.prismaField({
    type: 'VideoVariantDownload',
    args: {
      input: t.arg({ type: VideoVariantDownloadUpdateInput, required: true })
    },
    authScopes: {
      isPublisher: true
    },
    resolve: async (_query, _parent, { input }) => {
      return await prisma.videoVariantDownload.update({
        where: { id: input.id },
        data: {
          videoVariantId: input.videoVariantId ?? undefined,
          quality: input.quality ?? undefined,
          size: input.size ?? undefined,
          height: input.height ?? undefined,
          width: input.width ?? undefined,
          url: input.url ?? undefined
        }
      })
    }
  }),
  deleteVideoVariantDownload: t.prismaField({
    type: 'VideoVariantDownload',
    args: {
      id: t.arg.id({ required: true })
    },
    authScopes: {
      isPublisher: true
    },
    resolve: async (_query, _parent, { id }) => {
      return await prisma.videoVariantDownload.delete({
        where: { id }
      })
    }
  })
}))
