import { GraphQLError } from 'graphql'

import { prisma } from '../../../lib/prisma'
import { builder } from '../../builder'
import { getStaticRenditions } from '../../mux/video/service'

import { VideoVariantDownloadQuality } from './enums/videoVariantDownloadQuality'
import { VideoVariantDownloadCreateInput } from './inputs/videoVariantDownloadCreate'
import { VideoVariantDownloadUpdateInput } from './inputs/videoVariantDownloadUpdate'

builder.prismaObject('VideoVariantDownload', {
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    asset: t
      .withAuth({ isPublisher: true })
      .relation('asset', { nullable: true, description: 'master video file' }),
    quality: t.field({
      type: VideoVariantDownloadQuality,
      nullable: false,
      resolve: ({ quality }) => quality
    }),
    size: t.float({ nullable: false, resolve: ({ size }) => size ?? 0 }),
    height: t.int({ nullable: false, resolve: ({ height }) => height ?? 0 }),
    width: t.int({ nullable: false, resolve: ({ width }) => width ?? 0 }),
    bitrate: t.int({ nullable: false, resolve: ({ bitrate }) => bitrate ?? 0 }),
    url: t.exposeString('url', { nullable: false }),
    version: t.withAuth({ isPublisher: true }).exposeInt('version', {
      nullable: false,
      description: 'master video file version'
    })
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
  }),
  updateVideoVariantDownloadSizesFromMux: t
    .withAuth({ isPublisher: true })
    .field({
      type: 'Boolean',
      nullable: false,
      args: {
        videoVariantId: t.arg({ type: 'ID', required: true })
      },
      resolve: async (_parent, { videoVariantId }) => {
        // Get the video variant with mux video info
        const videoVariant = await prisma.videoVariant.findUniqueOrThrow({
          where: { id: videoVariantId },
          include: {
            muxVideo: true,
            downloads: true
          }
        })

        if (!videoVariant.muxVideo?.assetId) {
          throw new GraphQLError('No Mux asset found for this video variant', {
            extensions: { code: 'NOT_FOUND' }
          })
        }

        // Get static renditions from Mux
        const staticRenditions = await getStaticRenditions(
          videoVariant.muxVideo.assetId,
          false
        )

        if (!staticRenditions?.files) {
          throw new GraphQLError('No static renditions found', {
            extensions: { code: 'NOT_FOUND' }
          })
        }

        // Map Mux resolution to our quality levels
        const resolutionToQuality: Record<string, string> = {
          '720p': 'high',
          '360p': 'sd',
          '270p': 'low'
        }

        // Update each download with the correct size
        for (const download of videoVariant.downloads) {
          // Find the corresponding static rendition file
          const staticFile = staticRenditions.files.find((file) => {
            // Use resolution field first (which contains the actual quality like "720p", "360p", "270p")
            // Then fall back to resolution_tier if resolution is not available
            const muxResolution = file.resolution || file.resolution_tier
            return (
              muxResolution &&
              resolutionToQuality[muxResolution] === download.quality
            )
          })

          if (staticFile?.filesize && staticFile.status === 'ready') {
            const newSize = parseInt(staticFile.filesize, 10)

            await prisma.videoVariantDownload.update({
              where: { id: download.id },
              data: {
                size: newSize
              }
            })
          }
        }

        return true
      }
    })
}))
