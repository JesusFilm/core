import compact from 'lodash/compact'

import { prisma } from '../../lib/prisma'
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
      return await prisma.videoVariant.update({
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
    }
  }),
  videoVariantDelete: t.withAuth({ isPublisher: true }).prismaField({
    type: 'VideoVariant',
    nullable: false,
    args: {
      id: t.arg.id({ required: true })
    },
    resolve: async (query, _parent, { id }) => {
      return await prisma.videoVariant.delete({
        ...query,
        where: { id }
      })
    }
  })
}))
