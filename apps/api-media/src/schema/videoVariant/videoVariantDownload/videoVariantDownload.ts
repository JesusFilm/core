import { prisma } from '../../../lib/prisma'
import { builder } from '../../builder'

import { VideoVariantDownloadQuality } from './enums/videoVariantDownloadQuality'
import { VideoVariantDownloadCreateInput } from './inputs/videoVariantDownloadCreate'
import { VideoVariantDownloadUpdateInput } from './inputs/videoVariantDownloadUpdate'

builder.prismaObject('VideoVariantDownload', {
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    quality: t.field({
      type: VideoVariantDownloadQuality,
      nullable: false,
      resolve: ({ quality }) => quality
    }),
    size: t.float({ nullable: false, resolve: ({ size }) => size ?? 0 }),
    height: t.int({ nullable: false, resolve: ({ height }) => height ?? 0 }),
    width: t.int({ nullable: false, resolve: ({ width }) => width ?? 0 }),
    url: t.exposeString('url', { nullable: false })
  })
})

builder.mutationFields((t) => ({
  videoVariantDownloadCreate: t.withAuth({ isPublisher: true }).prismaField({
    type: 'VideoVariantDownload',
    nullable: false,
    args: {
      input: t.arg({ type: VideoVariantDownloadCreateInput, required: true })
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
  videoVariantDownloadUpdate: t.withAuth({ isPublisher: true }).prismaField({
    type: 'VideoVariantDownload',
    nullable: false,
    args: {
      input: t.arg({ type: VideoVariantDownloadUpdateInput, required: true })
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
  videoVariantDownloadDelete: t.withAuth({ isPublisher: true }).prismaField({
    type: 'VideoVariantDownload',
    nullable: false,
    args: {
      id: t.arg.id({ required: true })
    },
    resolve: async (_query, _parent, { id }) => {
      return await prisma.videoVariantDownload.delete({
        where: { id }
      })
    }
  })
}))
