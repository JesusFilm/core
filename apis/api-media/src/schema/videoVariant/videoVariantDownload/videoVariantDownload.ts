import { prisma } from '@core/prisma/media/client'

import { builder, toPrismaDateTimeFilter } from '../../builder'

import { VideoVariantDownloadQuality } from './enums/videoVariantDownloadQuality'
import { VideoVariantDownloadCreateInput } from './inputs/videoVariantDownloadCreate'
import { VideoVariantDownloadsFilter } from './inputs/videoVariantDownloadsFilter'
import { VideoVariantDownloadUpdateInput } from './inputs/videoVariantDownloadUpdate'

export const VideoVariantDownload = builder.prismaObject(
  'VideoVariantDownload',
  {
    fields: (t) => ({
      id: t.exposeID('id', { nullable: false }),
      updatedAt: t.expose('updatedAt', { type: 'DateTime', nullable: false }),
      videoVariantId: t.exposeID('videoVariantId', { nullable: true }),
      asset: t.withAuth({ isPublisher: true }).relation('asset', {
        nullable: true,
        description: 'master video file'
      }),
      quality: t.field({
        type: VideoVariantDownloadQuality,
        nullable: false,
        resolve: ({ quality }) => quality
      }),
      size: t.float({ nullable: false, resolve: ({ size }) => size ?? 0 }),
      height: t.int({ nullable: false, resolve: ({ height }) => height ?? 0 }),
      width: t.int({ nullable: false, resolve: ({ width }) => width ?? 0 }),
      bitrate: t.int({
        nullable: false,
        resolve: ({ bitrate }) => bitrate ?? 0
      }),
      url: t.exposeString('url', { nullable: false }),
      version: t.withAuth({ isPublisher: true }).exposeInt('version', {
        nullable: false,
        description: 'master video file version'
      })
    })
  }
)

builder.queryFields((t) => ({
  videoVariantDownloads: t.prismaField({
    type: ['VideoVariantDownload'],
    nullable: false,
    args: {
      where: t.arg({ type: VideoVariantDownloadsFilter, required: false }),
      offset: t.arg.int({ required: false }),
      limit: t.arg.int({ required: false })
    },
    resolve: async (query, _parent, { where, offset, limit }) => {
      return await prisma.videoVariantDownload.findMany({
        ...query,
        where: {
          updatedAt: toPrismaDateTimeFilter(where?.updatedAt),
          videoVariantId: where?.videoVariantId ?? undefined,
          quality: where?.quality ?? undefined
        },
        skip: offset ?? 0,
        take: limit ?? 100,
        orderBy: [{ updatedAt: 'asc' }, { id: 'asc' }]
      })
    }
  }),
  videoVariantDownloadsCount: t.int({
    nullable: false,
    args: {
      where: t.arg({ type: VideoVariantDownloadsFilter, required: false })
    },
    resolve: async (_parent, { where }) => {
      return await prisma.videoVariantDownload.count({
        where: {
          updatedAt: toPrismaDateTimeFilter(where?.updatedAt),
          videoVariantId: where?.videoVariantId ?? undefined,
          quality: where?.quality ?? undefined
        }
      })
    }
  })
}))

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
          id: input.id ?? undefined,
          assetId: input.assetId ?? undefined,
          version: input.version ?? undefined
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
          bitrate: input.bitrate ?? undefined,
          url: input.url ?? undefined,
          assetId: input.assetId ?? undefined,
          version: input.version ?? undefined
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
