import compact from 'lodash/compact'

import { Platform } from '.prisma/api-media-client'

import { prisma } from '../../lib/prisma'
import {
  videoCacheReset,
  videoVariantCacheReset
} from '../../lib/videoCacheReset'
import { updateVideoVariantInAlgolia } from '../../workers/algolia/service'
import { builder } from '../builder'
import { deleteR2File } from '../cloudflare/r2/asset'
import { Language } from '../language'
import { deleteVideo } from '../mux/video/service'

import { VideoVariantCreateInput } from './inputs/videoVariantCreate'
import { VideoVariantFilter } from './inputs/videoVariantFilter'
import { VideoVariantUpdateInput } from './inputs/videoVariantUpdate'

builder.prismaObject('VideoVariant', {
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    asset: t
      .withAuth({ isPublisher: true })
      .relation('asset', { nullable: true, description: 'master video file' }),
    videoId: t.exposeID('videoId'),
    hls: t.exposeString('hls'),
    dash: t.exposeString('dash'),
    share: t.exposeString('share'),
    downloadable: t.exposeBoolean('downloadable', { nullable: false }),
    downloads: t.prismaField({
      type: ['VideoVariantDownload'],
      nullable: false,
      resolve: async (query, parent, _args, context) => {
        // If clientName matches a platform in restrictDownloadPlatforms, return empty array
        if (context.clientName && parent.videoId) {
          const video = await prisma.video.findUnique({
            where: { id: parent.videoId },
            select: { restrictDownloadPlatforms: true }
          })

          if (
            video?.restrictDownloadPlatforms.includes(
              context.clientName as Platform
            )
          ) {
            return []
          }
        }

        // Otherwise, return the downloads
        return await prisma.videoVariantDownload.findMany({
          ...query,
          where: { videoVariantId: parent.id }
        })
      }
    }),
    duration: t.int({
      nullable: false,
      resolve: ({ duration }) => duration ?? 0
    }),
    lengthInMilliseconds: t.int({
      nullable: false,
      resolve: ({ lengthInMilliseconds }) => lengthInMilliseconds ?? 0
    }),
    language: t.field({
      type: Language,
      nullable: false,
      resolve: ({ languageId: id }) => ({ id })
    }),
    muxVideo: t.relation('muxVideo', { nullable: true }),
    brightcoveId: t.exposeString('brightcoveId'),
    published: t.exposeBoolean('published', { nullable: false }),
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
    }),
    version: t.withAuth({ isPublisher: true }).exposeInt('version', {
      nullable: false,
      description: 'version control for master video file'
    })
  })
})

builder.queryFields((t) => ({
  videoVariant: t.prismaField({
    type: 'VideoVariant',
    nullable: false,
    args: {
      id: t.arg.id({ required: true })
    },
    resolve: async (query, _parent, { id }) => {
      console.log('videoVariant', id)
      const videoVariant = await prisma.videoVariant.findUnique({
        ...query,
        where: { id }
      })
      if (videoVariant == null)
        throw new Error(`VideoVariant with id ${id} not found`)
      return videoVariant
    }
  }),
  videoVariants: t.prismaField({
    type: ['VideoVariant'],
    nullable: false,
    args: {
      input: t.arg({ type: VideoVariantFilter, required: false })
    },
    resolve: async (query, _parent, { input }) =>
      await prisma.videoVariant.findMany({
        ...query,

        where: {
          published: input?.onlyPublished === false ? undefined : true
        }
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
      const newVariant = await prisma.videoVariant.create({
        ...query,
        data: {
          ...input,
          muxVideoId: input.muxVideoId ?? undefined,
          published: input.published ?? true,
          version: input.version ?? undefined
        }
      })
      const video = await prisma.video.findUnique({
        where: { id: newVariant.videoId },
        select: { availableLanguages: true }
      })
      const currentLanguages = video?.availableLanguages || []
      const updatedLanguages = Array.from(
        new Set([...currentLanguages, newVariant.languageId])
      )
      await prisma.video.update({
        where: { id: newVariant.videoId },
        data: { availableLanguages: updatedLanguages }
      })

      // Save the videoId before the try/catch block
      const { id, videoId } = newVariant

      try {
        await updateVideoVariantInAlgolia(id)
      } catch (error) {
        console.error('Algolia update error:', error)
      }

      try {
        void videoVariantCacheReset(id)
        void videoCacheReset(videoId)
      } catch (error) {
        // Log the error but don't throw it
        console.error('Cache reset error:', error)
      }
      return newVariant
    }
  }),
  videoVariantUpdate: t.withAuth({ isPublisher: true }).prismaField({
    type: 'VideoVariant',
    nullable: false,
    args: {
      input: t.arg({ type: VideoVariantUpdateInput, required: true })
    },
    resolve: async (query, _parent, { input }) => {
      const updated = await prisma.videoVariant.update({
        ...query,
        where: { id: input.id },
        data: {
          hls: input.hls ?? undefined,
          dash: input.dash ?? undefined,
          share: input.share ?? undefined,
          duration: input.duration ?? undefined,
          lengthInMilliseconds: input.lengthInMilliseconds ?? undefined,
          languageId: input.languageId ?? undefined,
          slug: input.slug ?? undefined,
          videoId: input.videoId ?? undefined,
          edition: input.edition ?? undefined,
          downloadable: input.downloadable ?? undefined,
          published: input.published ?? undefined,
          muxVideoId: input.muxVideoId ?? undefined,
          assetId: input.assetId ?? undefined,
          version: input.version ?? undefined,
          brightcoveId: input.brightcoveId ?? undefined
        }
      })

      // Store the videoId before the try/catch block
      const videoId = input.videoId ?? updated.videoId

      try {
        await updateVideoVariantInAlgolia(updated.id)
      } catch (error) {
        console.error('Algolia update error:', error)
      }

      try {
        void videoVariantCacheReset(updated.id)
        // Reset the video cache if we have a videoId
        if (videoId) {
          void videoCacheReset(videoId)
        }
      } catch (error) {
        // Log the error but don't throw it
        console.error('Cache reset error:', error)
      }
      return updated
    }
  }),
  videoVariantDelete: t.withAuth({ isPublisher: true }).prismaField({
    type: 'VideoVariant',
    nullable: false,
    args: {
      id: t.arg.id({ required: true })
    },
    resolve: async (query, _parent, { id }) => {
      // Get the video variant with all associated assets
      const variant = await prisma.videoVariant.findUnique({
        where: { id },
        include: {
          downloads: {
            include: {
              asset: true
            }
          },
          asset: true,
          muxVideo: true
        }
      })

      if (variant == null) {
        throw new Error(`VideoVariant with id ${id} not found`)
      }

      // Store videoId to use later
      const { videoId } = variant

      // Clean up R2 assets
      const assetsToDelete: string[] = []

      // Add main variant asset if it exists
      if (variant.assetId != null) {
        assetsToDelete.push(variant.assetId)
      }

      // Add download assets if they exist
      if (variant.downloads) {
        variant.downloads.forEach((download) => {
          if (download.assetId != null) {
            assetsToDelete.push(download.assetId)
          }
        })
      }

      // Delete R2 assets
      for (const assetId of assetsToDelete) {
        try {
          // Get the R2 asset record to get the fileName
          const r2Asset = await prisma.cloudflareR2.findUnique({
            where: { id: assetId },
            select: { fileName: true }
          })

          if (r2Asset?.fileName != null) {
            // Delete the actual file from Cloudflare R2 storage
            await deleteR2File(r2Asset.fileName)
          }

          // Delete the database record
          await prisma.cloudflareR2.delete({
            where: { id: assetId }
          })
        } catch (error) {
          // Log error but continue with other deletions
          console.error(`Failed to delete R2 asset ${assetId}:`, error)
        }
      }

      // Clean up Mux asset
      if (variant.muxVideoId != null && variant.muxVideo != null) {
        try {
          // Delete from Mux service first (using assetId, not our database ID)
          if (variant.muxVideo.assetId != null) {
            await deleteVideo(variant.muxVideo.assetId, false)
          }

          // Delete from our database
          await prisma.muxVideo.delete({
            where: { id: variant.muxVideoId }
          })
        } catch (error) {
          // Log error but continue with variant deletion
          console.error(
            `Failed to delete Mux video ${variant.muxVideoId}:`,
            error
          )
        }
      }

      // Delete the video variant
      const deleted = await prisma.videoVariant.delete({
        ...query,
        where: { id }
      })
      try {
        await updateVideoVariantInAlgolia(id)
      } catch (error) {
        console.error('Algolia update error:', error)
      }
      try {
        void videoVariantCacheReset(id)
        void videoCacheReset(videoId)
      } catch (error) {
        // Log the error but don't throw it
        console.error('Cache reset error:', error)
      }
      return deleted
    }
  })
}))
