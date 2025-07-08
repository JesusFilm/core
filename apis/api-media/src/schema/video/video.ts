import { GraphQLError } from 'graphql'
import compact from 'lodash/compact'
import isEmpty from 'lodash/isEmpty'
import orderBy from 'lodash/orderBy'

import { Prisma, Platform as PrismaPlatform } from '.prisma/api-media-client'

import { prisma } from '../../lib/prisma'
import { videoCacheReset } from '../../lib/videoCacheReset'
import { updateVideoInAlgolia } from '../../workers/algolia/service'
import { builder } from '../builder'
import { ImageAspectRatio } from '../cloudflare/image/enums'
import { deleteR2File } from '../cloudflare/r2/asset'
import { IdType, IdTypeShape } from '../enums/idType'
import { Language, LanguageWithSlug } from '../language'
import { deleteVideo } from '../mux/video/service'
import { VideoSource, VideoSourceShape } from '../videoSource/videoSource'
import { VideoVariantFilter } from '../videoVariant/inputs/videoVariantFilter'

import { Platform } from './enums/platform'
import { VideoLabel } from './enums/videoLabel'
import { VideoCreateInput } from './inputs/videoCreate'
import { VideosFilter } from './inputs/videosFilter'
import { VideoUpdateInput } from './inputs/videoUpdate'
import { videosFilter } from './lib/videosFilter'

// Helper function to check if video viewing is restricted for the current platform
function isVideoViewRestricted(
  restrictViewPlatforms: PrismaPlatform[],
  clientName?: string
): boolean {
  return (
    clientName != null &&
    clientName !== '' &&
    restrictViewPlatforms.includes(clientName as PrismaPlatform)
  )
}

function isValidClientName(clientName?: string): boolean {
  return (
    clientName != null &&
    clientName !== '' &&
    Object.values(PrismaPlatform).includes(clientName as PrismaPlatform)
  )
}

interface Info {
  variableValues:
    | Record<
        string,
        Array<
          Array<{
            id: string
            primaryLanguageId: string
          }>
        >
      >
    | Array<{ id: string; primaryLanguageId: string }>
}

export function getLanguageIdFromInfo(
  info: unknown,
  parentId: string
): string | undefined {
  return typeof (info as Info).variableValues === 'object'
    ? Object.values((info as Info).variableValues).find(
        (inner) =>
          Array.isArray(inner) &&
          inner.find(({ id }: { id: string }) => id === parentId)
      )?.[0].primaryLanguageId
    : (
        (info as Info).variableValues as Array<{
          id: string
          primaryLanguageId: string
        }>
      )?.find(({ id }: { id: string }) => id === parentId)?.primaryLanguageId
}

const Video = builder.prismaObject('Video', {
  shareable: true,
  fields: (t) => ({
    bibleCitations: t.relation('bibleCitation', {
      nullable: false,
      query: () => ({
        orderBy: { order: 'asc' }
      })
    }),
    origin: t.relation('origin', {
      nullable: true
    }),
    source: t.field({
      type: VideoSource,
      shareable: true,
      resolve: () => VideoSourceShape.internal
    }),
    keywords: t.relation('keywords', {
      nullable: false,
      args: { languageId: t.arg.id({ required: false }) },
      query: ({ languageId }) => ({
        where: { languageId: languageId ?? '529' }
      })
    }),
    id: t.exposeID('id', { nullable: false }),
    label: t.expose('label', { type: VideoLabel, nullable: false }),
    locked: t.exposeBoolean('locked', { nullable: false }),
    primaryLanguageId: t.exposeID('primaryLanguageId', { nullable: false }),
    published: t.exposeBoolean('published', { nullable: false }),
    cloudflareAssets: t.relation('cloudflareAssets', { nullable: false }),
    videoEditions: t.relation('videoEditions', { nullable: false }),
    availableLanguages: t.stringList({
      nullable: false,
      resolve: ({ availableLanguages }) => availableLanguages
    }),
    title: t.relation('title', {
      nullable: false,
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
        orderBy: { primary: 'desc' }
      })
    }),
    snippet: t.relation('snippet', {
      nullable: false,
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
        orderBy: { primary: 'desc' }
      })
    }),
    description: t.relation('description', {
      nullable: false,
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
        orderBy: { primary: 'desc' }
      })
    }),
    studyQuestions: t.relation('studyQuestions', {
      nullable: false,
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
        orderBy: { order: 'asc' }
      })
    }),
    imageAlt: t.relation('imageAlt', {
      nullable: false,
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
        orderBy: { primary: 'desc' }
      })
    }),
    variantLanguages: t.field({
      type: [Language],
      nullable: false,
      args: {},
      resolve: async ({ id: videoId }) =>
        (
          await prisma.videoVariant.findMany({
            where: { videoId },
            select: { languageId: true }
          })
        ).map(({ languageId }) => ({ id: languageId }))
    }),
    variantLanguagesCount: t.int({
      nullable: false,
      args: {
        input: t.arg({ type: VideoVariantFilter, required: false })
      },
      resolve: async ({ id: videoId }, { input }) =>
        await prisma.videoVariant.count({
          where: {
            videoId,
            published: input?.onlyPublished === false ? undefined : true
          }
        })
    }),
    slug: t.string({
      nullable: false,
      resolve: ({ slug }) => slug ?? '',
      description: 'slug is a permanent link to the video.'
    }),
    noIndex: t.exposeBoolean('noIndex'),
    children: t.prismaField({
      type: ['Video'],
      nullable: false,
      async resolve(query, parent, _args, context) {
        if (parent.childIds.length === 0) return []

        const whereCondition: Prisma.VideoWhereInput = {
          id: { in: parent.childIds }
        }

        // Add platform restriction filter if clientName is provided
        if (isValidClientName(context.clientName)) {
          whereCondition.NOT = {
            restrictViewPlatforms: {
              has: context.clientName as PrismaPlatform
            }
          }
        }

        return orderBy(
          await prisma.video.findMany({
            ...query,
            where: whereCondition
          }),
          ({ id }) => parent.childIds.indexOf(id),
          'asc'
        )
      }
    }),
    childrenCount: t.int({
      nullable: false,
      resolve: async ({ id }) =>
        await prisma.video.count({ where: { parent: { some: { id } } } }),
      description: 'the number value of the amount of children on a video'
    }),
    parents: t.prismaField({
      type: ['Video'],
      nullable: false,
      async resolve(query, child: { id: string }, _args, context) {
        const whereCondition: Prisma.VideoWhereInput = {
          childIds: {
            has: child.id
          }
        }

        // Add platform restriction filter if clientName is provided
        if (isValidClientName(context.clientName)) {
          whereCondition.NOT = {
            restrictViewPlatforms: {
              has: context.clientName as PrismaPlatform
            }
          }
        }

        return await prisma.video.findMany({
          ...query,
          where: whereCondition
        })
      }
    }),
    variantLanguagesWithSlug: t.field({
      type: [LanguageWithSlug],
      nullable: false,
      args: {
        input: t.arg({ type: VideoVariantFilter, required: false })
      },
      resolve: async ({ id: videoId }, { input }) =>
        (
          await prisma.videoVariant.findMany({
            where: {
              videoId,
              published: input?.onlyPublished === false ? undefined : true
            },
            select: { languageId: true, slug: true }
          })
        ).map(({ slug, languageId: id }) => ({
          slug,
          language: { id }
        }))
    }),
    variants: t.prismaField({
      type: ['VideoVariant'],
      nullable: false,
      args: {
        input: t.arg({ type: VideoVariantFilter, required: false })
      },
      resolve: async (query, parent, { input }) => {
        const res = await prisma.videoVariant.findMany({
          ...query,
          where: {
            videoId: parent.id,
            published: input?.onlyPublished === false ? undefined : true
          }
        })
        // languageId is a string, so we need to convert it to a number to sort it correctly
        return orderBy(res, (variant) => +variant.languageId, 'asc')
      }
    }),
    subtitles: t.relation('subtitles', {
      nullable: false,
      args: {
        languageId: t.arg.id({ required: false }),
        primary: t.arg.boolean({ required: false }),
        edition: t.arg.string({ required: false })
      },
      query: ({ languageId, primary, edition }) => ({
        where: {
          OR:
            languageId == null && primary == null && edition == null
              ? undefined
              : [
                  {
                    languageId: languageId ?? undefined
                  },
                  {
                    primary: primary ?? undefined
                  },
                  {
                    edition: edition ?? undefined
                  }
                ]
        },
        orderBy: { primary: 'desc' }
      })
    }),
    variant: t.prismaField({
      type: 'VideoVariant',
      args: { languageId: t.arg.id({ required: false }) },
      resolve: async (query, parent, { languageId }, _ctx, info) => {
        const variableValueId =
          (info.variableValues.id as string | undefined) ??
          (info.variableValues.contentId as string | undefined) ??
          (info.variableValues._1_contentId as string | undefined) ??
          ''
        const requestedLanguage = variableValueId.includes('/')
          ? variableValueId.substring(variableValueId.lastIndexOf('/') + 1)
          : ''

        const journeysLanguageIdForBlock = getLanguageIdFromInfo(
          info,
          parent.id
        )

        if (
          info.variableValues.idType !== IdTypeShape.databaseId &&
          !isEmpty(variableValueId) &&
          !isEmpty(requestedLanguage)
        ) {
          const slug = `${parent.slug as string}/${requestedLanguage}`
          return await prisma.videoVariant.findUnique({
            ...query,
            where: {
              slug
            }
          })
        }

        const primaryLanguageId =
          languageId ?? journeysLanguageIdForBlock ?? '529'

        return await prisma.videoVariant.findUnique({
          ...query,
          where: {
            languageId_videoId: {
              videoId: parent.id,
              languageId: primaryLanguageId
            }
          }
        })
      }
    }),
    images: t.relation('images', {
      nullable: false,
      args: {
        aspectRatio: t.arg({
          type: ImageAspectRatio,
          required: false
        })
      },
      query: ({ aspectRatio }) => ({
        where: {
          aspectRatio: aspectRatio ?? undefined
        },
        orderBy: { aspectRatio: 'desc' }
      })
    }),
    restrictDownloadPlatforms: t.withAuth({ isPublisher: true }).field({
      type: [Platform],
      nullable: false,
      resolve: ({ restrictDownloadPlatforms }) => restrictDownloadPlatforms
    }),
    restrictViewPlatforms: t.withAuth({ isPublisher: true }).field({
      type: [Platform],
      nullable: false,
      resolve: ({ restrictViewPlatforms }) => restrictViewPlatforms
    }),
    publishedAt: t.expose('publishedAt', { type: 'Date', nullable: true })
  })
})

builder.asEntity(Video, {
  key: builder.selection<{ id: string; primaryLanguageId: string }>(
    'id primaryLanguageId'
  ),
  resolveReference: async ({ id }) =>
    await prisma.video.findUniqueOrThrow({ where: { id } })
})

builder.queryFields((t) => ({
  adminVideo: t.withAuth({ isPublisher: true }).prismaField({
    type: 'Video',
    nullable: false,
    args: {
      id: t.arg.id({ required: true }),
      idType: t.arg({
        type: IdType,
        defaultValue: IdTypeShape.databaseId
      })
    },
    resolve: async (query, _parent, { id, idType }) => {
      return idType === IdTypeShape.slug
        ? await prisma.video.findFirstOrThrow({
            ...query,
            where: { variants: { some: { slug: id } } }
          })
        : await prisma.video.findUniqueOrThrow({
            ...query,
            where: { id }
          })
    }
  }),
  adminVideos: t.withAuth({ isPublisher: true }).prismaField({
    type: ['Video'],
    nullable: false,
    args: {
      where: t.arg({ type: VideosFilter, required: false }),
      offset: t.arg.int({ required: false }),
      limit: t.arg.int({ required: false })
    },
    resolve: async (query, _parent, { offset, limit, where }) => {
      const filter = videosFilter(where ?? {})
      return await prisma.video.findMany({
        ...query,
        where: filter,
        skip: offset ?? 0,
        take: limit ?? 100
      })
    }
  }),
  adminVideosCount: t.withAuth({ isPublisher: true }).int({
    args: { where: t.arg({ type: VideosFilter, required: false }) },
    nullable: false,
    resolve: async (_parent, { where }) => {
      const filter = videosFilter(where ?? {})
      return await prisma.video.count({
        where: filter
      })
    }
  }),
  video: t.prismaField({
    type: 'Video',
    nullable: false,
    args: {
      id: t.arg.id({ required: true }),
      idType: t.arg({
        type: IdType,
        defaultValue: IdTypeShape.databaseId
      })
    },
    resolve: async (query, _parent, { id, idType }, context) => {
      try {
        const video =
          idType === IdTypeShape.slug
            ? await prisma.video.findFirstOrThrow({
                ...query,
                where: { variants: { some: { slug: id } }, published: true }
              })
            : await prisma.video.findUniqueOrThrow({
                ...query,
                where: { id, published: true }
              })

        // Check if video viewing is restricted for the current platform
        if (
          isVideoViewRestricted(video.restrictViewPlatforms, context.clientName)
        ) {
          throw new GraphQLError(`Video not found with id ${idType}:${id}`)
        }

        return video
      } catch (err) {
        if (
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === 'P2025'
        ) {
          throw new GraphQLError(`Video not found with id ${idType}:${id}`)
        }
        throw err
      }
    }
  }),
  videos: t.prismaField({
    type: ['Video'],
    nullable: false,
    args: {
      where: t.arg({ type: VideosFilter, required: false }),
      offset: t.arg.int({ required: false }),
      limit: t.arg.int({ required: false })
    },
    resolve: async (query, _parent, { offset, limit, where }, context) => {
      const filter = videosFilter(where ?? {})
      filter.published = true

      // Add platform restriction filter if clientName is provided
      if (isValidClientName(context.clientName)) {
        filter.NOT = {
          ...filter.NOT,
          restrictViewPlatforms: {
            has: context.clientName as PrismaPlatform
          }
        }
      }

      return await prisma.video.findMany({
        ...query,
        where: filter,
        skip: offset ?? 0,
        take: limit ?? 100
      })
    }
  }),
  videosCount: t.int({
    args: { where: t.arg({ type: VideosFilter, required: false }) },
    nullable: false,
    resolve: async (_parent, { where }, context) => {
      const filter = videosFilter(where ?? {})
      filter.published = true

      // Add platform restriction filter if clientName is provided
      if (isValidClientName(context.clientName)) {
        filter.NOT = {
          ...filter.NOT,
          restrictViewPlatforms: {
            has: context.clientName as PrismaPlatform
          }
        }
      }

      return await prisma.video.count({
        where: filter
      })
    }
  })
}))

builder.mutationFields((t) => ({
  videoCreate: t.withAuth({ isPublisher: true }).prismaField({
    type: 'Video',
    nullable: false,
    args: {
      input: t.arg({ type: VideoCreateInput, required: true })
    },
    resolve: async (query, _parent, { input }) => {
      const data = {
        ...input,
        // Set publishedAt to current timestamp if published is true
        publishedAt: input.published ? new Date() : undefined
      }

      const video = await prisma.video.create({
        ...query,
        data
      })
      try {
        await updateVideoInAlgolia(video.id)
      } catch (error) {
        console.error('Algolia update error:', error)
      }

      try {
        await videoCacheReset(video.id)
      } catch {}

      return video
    }
  }),
  videoUpdate: t.withAuth({ isPublisher: true }).prismaField({
    type: 'Video',
    nullable: false,
    args: {
      input: t.arg({ type: VideoUpdateInput, required: true })
    },
    resolve: async (query, _parent, { input }) => {
      // If published is being set to true, we need to check if publishedAt should be set
      let publishedAtUpdate = undefined
      if (input.published === true) {
        // Check if the video already has a publishedAt value
        const existingVideo = await prisma.video.findUnique({
          where: { id: input.id },
          select: { publishedAt: true }
        })

        // Only set publishedAt if it's not already set
        if (existingVideo?.publishedAt == null) {
          publishedAtUpdate = new Date()
        }
      }

      const video = await prisma.video.update({
        ...query,
        where: { id: input.id },
        data: {
          label: input.label ?? undefined,
          primaryLanguageId: input.primaryLanguageId ?? undefined,
          published: input.published ?? undefined,
          publishedAt: publishedAtUpdate,
          slug: input.slug ?? undefined,
          noIndex: input.noIndex ?? undefined,
          childIds: input.childIds ?? undefined,
          restrictDownloadPlatforms:
            input.restrictDownloadPlatforms ?? undefined,
          restrictViewPlatforms: input.restrictViewPlatforms ?? undefined,
          ...(input.keywordIds
            ? { keywords: { set: input.keywordIds.map((id) => ({ id })) } }
            : {})
        },
        include: {
          ...query.include,
          children: true
        }
      })
      try {
        await updateVideoInAlgolia(video.id)
      } catch (error) {
        console.error('Algolia update error:', error)
      }

      try {
        await videoCacheReset(video.id)
      } catch {}

      return video
    }
  }),
  videoDelete: t.withAuth({ isPublisher: true }).prismaField({
    type: 'Video',
    nullable: false,
    args: {
      id: t.arg.id({ required: true })
    },
    resolve: async (query, _parent, { id }) => {
      // First, get the video to check if it has ever been published
      const video = await prisma.video.findUnique({
        where: { id },
        select: {
          id: true,
          published: true,
          publishedAt: true,
          // Get data for cleanup that won't cascade automatically
          variants: {
            select: {
              muxVideoId: true,
              muxVideo: {
                select: {
                  assetId: true
                }
              }
            }
          },
          cloudflareAssets: {
            select: {
              id: true,
              fileName: true
            }
          }
        }
      })

      if (video == null) {
        throw new GraphQLError(`Video with id ${id} not found`)
      }

      // Only allow deletion of videos that have never been published (publishedAt is null)
      if (video.publishedAt != null) {
        throw new GraphQLError(
          'Cannot delete videos that have been published. Only draft videos that have never been published can be deleted.'
        )
      }

      // Clean up assets that won't cascade automatically

      // 1. Delete CloudflareR2 assets (these don't cascade)
      for (const asset of video.cloudflareAssets) {
        try {
          // Delete the actual file from Cloudflare R2 storage
          if (asset.fileName != null) {
            await deleteR2File(asset.fileName)
          }

          // Delete the database record
          await prisma.cloudflareR2.delete({
            where: { id: asset.id }
          })
        } catch (error) {
          // Log error but continue with other deletions
          console.error(`Failed to delete R2 asset ${asset.id}:`, error)
        }
      }

      // 2. Clean up Mux assets (these don't cascade and need external API calls)
      for (const variant of video.variants) {
        if (variant.muxVideoId != null && variant.muxVideo?.assetId != null) {
          try {
            // Delete from Mux service first
            await deleteVideo(variant.muxVideo.assetId, false)

            // Delete from our database
            await prisma.muxVideo.delete({
              where: { id: variant.muxVideoId }
            })
          } catch (error) {
            // Log error but continue with deletion
            console.error(
              `Failed to delete Mux video ${variant.muxVideoId}:`,
              error
            )
          }
        }
      }

      // 3. Delete BibleCitations manually (these don't cascade)
      await prisma.bibleCitation.deleteMany({
        where: { videoId: id }
      })

      // 4. Delete the video (this will cascade delete most related records automatically)
      const deletedVideo = await prisma.video.delete({
        ...query,
        where: { id }
      })

      try {
        await updateVideoInAlgolia(id)
      } catch (error) {
        console.error('Algolia update error:', error)
      }

      try {
        await videoCacheReset(id)
      } catch (error) {
        console.error('Cache reset error:', error)
      }

      return deletedVideo
    }
  })
}))
