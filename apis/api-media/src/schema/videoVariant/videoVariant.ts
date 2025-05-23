import compact from 'lodash/compact'

import { prisma } from '../../lib/prisma'
import {
  videoCacheReset,
  videoVariantCacheReset
} from '../../lib/videoCacheReset'
import { builder } from '../builder'
import { Language } from '../language'

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
    downloads: t.relation('downloads', { nullable: false }),
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
          version: input.version ?? undefined
        }
      })

      // Store the videoId before the try/catch block
      const videoId = input.videoId ?? updated.videoId

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
      // Get the video variant first to ensure we have videoId for cache reset
      const variant = await prisma.videoVariant.findUnique({
        where: { id },
        select: { videoId: true }
      })

      if (variant == null) {
        throw new Error(`VideoVariant with id ${id} not found`)
      }

      // Store videoId to use later
      const { videoId } = variant

      const deleted = await prisma.videoVariant.delete({
        ...query,
        where: { id }
      })

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
