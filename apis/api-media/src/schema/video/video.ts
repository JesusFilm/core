import { GraphQLError } from 'graphql'
import compact from 'lodash/compact'
import isEmpty from 'lodash/isEmpty'
import orderBy from 'lodash/orderBy'

import {
  Prisma,
  Platform as PrismaPlatform,
  prisma
} from '@core/prisma/media/client'

import { updateVideoInAlgolia } from '../../lib/algolia/algoliaVideoUpdate'
import { updateVideoVariantInAlgolia } from '../../lib/algolia/algoliaVideoVariantUpdate'
import { videoCacheReset, videoVariantCacheReset } from '../../lib/videoCacheReset'
import { builder } from '../builder'
import { ImageAspectRatio } from '../cloudflare/image/enums'
import { deleteR2File } from '../cloudflare/r2/asset'
import { IdType, IdTypeShape } from '../enums/idType'
import { NotUniqueError } from '../error/NotUniqueError'
import { Language, LanguageWithSlug } from '../language'
import { deleteVideo } from '../mux/video/service'
import { VideoSource, VideoSourceShape } from '../videoSource/videoSource'
import { VideoVariantFilter } from '../videoVariant/inputs/videoVariantFilter'
import {
  VideoVariant,
  handleParentVariantCleanup,
  handleParentVariantCreation
} from '../videoVariant/videoVariant'

import { Platform } from './enums/platform'
import { VideoLabel } from './enums/videoLabel'
import { VideoCreateInput } from './inputs/videoCreate'
import { VideosFilter } from './inputs/videosFilter'
import { VideoUpdateInput } from './inputs/videoUpdate'
import { videosFilter } from './lib/videosFilter'

// Result object for publishing children only
const VideoPublishChildrenResult = builder.objectRef<{ parentId: string; publishedChildIds: string[]; publishedChildrenCount: number }>(
  'VideoPublishChildrenResult'
)
VideoPublishChildrenResult.implement({
  fields: (t) => ({
    parentId: t.id({ resolve: (obj) => obj.parentId }),
    publishedChildIds: t.idList({ resolve: (obj) => obj.publishedChildIds }),
    publishedChildrenCount: t.int({ resolve: (obj) => obj.publishedChildrenCount })
  })
})

// Result object for publishing children and their language variants
const VideoPublishChildrenAndLanguagesResult = builder.objectRef<{
  parentId: string
  publishedChildIds: string[]
  publishedChildrenCount: number
  publishedVariantIds: string[]
  publishedVariantsCount: number
}>('VideoPublishChildrenAndLanguagesResult')
VideoPublishChildrenAndLanguagesResult.implement({
  fields: (t) => ({
    parentId: t.id({ resolve: (obj) => obj.parentId }),
    publishedChildIds: t.idList({ resolve: (obj) => obj.publishedChildIds }),
    publishedChildrenCount: t.int({ resolve: (obj) => obj.publishedChildrenCount }),
    publishedVariantIds: t.idList({ resolve: (obj) => obj.publishedVariantIds }),
    publishedVariantsCount: t.int({ resolve: (obj) => obj.publishedVariantsCount })
  })
})

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
  include: {
    childIds: true
  },
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
      select: () => ({
        variants: {
          select: {
            languageId: true
          }
        }
      }),
      resolve: (video) =>
        video.variants.map(({ languageId }) => ({
          id: languageId
        }))
    }),
    variantLanguagesCount: t.relationCount('variants', {
      nullable: false,
      args: {
        input: t.arg({ type: VideoVariantFilter, required: false })
      },
      where: ({ input }) => ({
        published: input?.onlyPublished === false ? undefined : true,
        languageId: input?.languageId ?? undefined
      })
    }),
    slug: t.string({
      nullable: false,
      resolve: ({ slug }) => slug ?? '',
      description: 'slug is a permanent link to the video.'
    }),
    noIndex: t.exposeBoolean('noIndex'),
    childrenCount: t.relationCount('children', {
      nullable: false,
      where: { published: true },
      description:
        'The number of published child videos associated with this video'
    }),
    variantLanguagesWithSlug: t.field({
      type: [LanguageWithSlug],
      nullable: false,
      args: {
        input: t.arg({ type: VideoVariantFilter, required: false })
      },
      select: ({ input }) => ({
        variants: {
          select: {
            languageId: true,
            slug: true
          },
          where: {
            published: input?.onlyPublished === false ? undefined : true,
            languageId: input?.languageId ?? undefined
          }
        }
      }),
      resolve: (video) =>
        video.variants.map(({ slug, languageId }) => ({
          slug,
          language: { id: languageId }
        }))
    }),
    variants: t.field({
      type: [VideoVariant],
      nullable: false,
      args: {
        input: t.arg({ type: VideoVariantFilter, required: false })
      },
      select: ({ input }) => ({
        variants: {
          where: {
            published: input?.onlyPublished === false ? undefined : true,
            languageId: input?.languageId ?? undefined
          }
        }
      }),
      resolve: (video) => {
        // languageId is a string, so we need to convert it to a number to sort it correctly
        return orderBy(video.variants, (variant) => +variant.languageId, 'asc')
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
      deprecationReason: 'Use variants instead',
      type: VideoVariant,
      args: {
        languageId: t.arg.id({ required: false }),
        input: t.arg({ type: VideoVariantFilter, required: false })
      },
      resolve: async (query, video, { languageId, input }, _ctx, info) => {
        const variableValueId =
          (info.variableValues.id as string | undefined) ??
          (info.variableValues.contentId as string | undefined) ??
          (info.variableValues._1_contentId as string | undefined) ??
          (info.variableValues.containerId as string | undefined) ??
          (info.variableValues._1_containerId as string | undefined) ??
          ''
        const requestedLanguage = variableValueId.includes('/')
          ? variableValueId.substring(variableValueId.lastIndexOf('/') + 1)
          : ''

        const journeysLanguageIdForBlock = getLanguageIdFromInfo(info, video.id)

        if (
          info.variableValues.idType !== IdTypeShape.databaseId &&
          !isEmpty(variableValueId) &&
          !isEmpty(requestedLanguage)
        ) {
          const slug = `${video.slug as string}/${requestedLanguage}`
          return await prisma.videoVariant.findUnique({
            ...query,
            where: {
              slug,
              published: input?.onlyPublished === false ? undefined : true
            }
          })
        }

        const primaryLanguageId =
          languageId ?? journeysLanguageIdForBlock ?? '529'

        return await prisma.videoVariant.findUnique({
          ...query,
          where: {
            languageId_videoId: {
              videoId: video.id,
              languageId: primaryLanguageId
            },
            published: input?.onlyPublished === false ? undefined : true
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

builder.prismaObjectField(Video, 'children', (t) =>
  t.field({
    type: [Video],
    nullable: false,
    select: (_args, context) => {
      const whereCondition: Prisma.VideoWhereInput = {}
      if (isValidClientName(context.clientName)) {
        whereCondition.NOT = {
          restrictViewPlatforms: {
            has: context.clientName as PrismaPlatform
          }
        }
      }
      return {
        children: {
          where: whereCondition
        }
      }
    },
    resolve: (video) => {
      return orderBy(
        video.children,
        ({ id }) => video.childIds.indexOf(id),
        'asc'
      )
    }
  })
)

builder.prismaObjectField(Video, 'parents', (t) =>
  t.field({
    type: [Video],
    nullable: false,
    select: (_args, context) => {
      const whereCondition: Prisma.VideoWhereInput = {}
      if (isValidClientName(context.clientName)) {
        whereCondition.NOT = {
          restrictViewPlatforms: {
            has: context.clientName as PrismaPlatform
          }
        }
      }
      return {
        parents: {
          where: whereCondition
        }
      }
    },
    resolve: (video) => video.parents
  })
)

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
      // Handle child relation synchronization if childIds is provided
      let childRelationData = {}
      if (input.childIds && input.childIds.length > 0) {
        // Get all existing video IDs to validate child IDs
        const videos = await prisma.video.findMany({
          select: { id: true }
        })
        const existingVideoIds = new Set(videos.map((video) => video.id))

        // Filter out any child IDs that don't exist
        const validChildIds = (input.childIds || []).filter((id) =>
          existingVideoIds.has(id)
        )

        // Update the children relation
        childRelationData = {
          children: {
            connect: validChildIds.map((id) => ({ id }))
          }
        }
      }

      const data = {
        ...input,
        // Set publishedAt to current timestamp if published is true
        publishedAt: input.published ? new Date() : undefined,
        ...childRelationData
      }

      try {
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
        } catch (error) {
          console.error('Cache reset error:', error)
        }

        return video
      } catch (e) {
        if (
          e instanceof Prisma.PrismaClientKnownRequestError &&
          e.code === 'P2002'
        ) {
          // Handle unique constraint violation
          const target = e.meta?.target as string[] | undefined
          if (target?.includes('slug')) {
            throw new NotUniqueError('Video slug already exists', [
              { path: ['input', 'slug'], value: input.slug ?? '' }
            ])
          }
          if (target?.includes('id')) {
            throw new NotUniqueError('Video ID already exists', [
              { path: ['input', 'id'], value: input.id ?? '' }
            ])
          }
          // If it's not a slug or id constraint, throw a generic unique error
          throw new NotUniqueError(
            'Video with this information already exists',
            [{ path: ['input'], value: 'duplicate' }]
          )
        }
        throw e
      }
    }
  }),
  videoUpdate: t.withAuth({ isPublisher: true }).prismaField({
    type: 'Video',
    nullable: false,
    args: {
      input: t.arg({ type: VideoUpdateInput, required: true })
    },
    resolve: async (query, _parent, { input }) => {
      // Get current video data to check if published status is changing and to prevent slug change after publish
      const currentVideo =
        input.published !== undefined || input.slug !== undefined
          ? await prisma.video.findUnique({
              where: { id: input.id },
              select: {
                published: true,
                publishedAt: true,
                slug: true,
                variants: {
                  where: { published: true },
                  select: { languageId: true }
                }
              }
            })
          : null

      // Prevent changing slug after video has been published
      if (
        input.slug != null &&
        input.slug !== currentVideo?.slug &&
        currentVideo?.publishedAt != null
      ) {
        throw new Error('Cannot change slug after video has been published')
      }

      // If published is being set to true, we need to check if publishedAt should be set
      let publishedAtUpdate = undefined
      if (input.published === true) {
        // Only set publishedAt if it's not already set
        if (currentVideo?.publishedAt == null) {
          publishedAtUpdate = new Date()
        }
      }

      // Handle child relation synchronization if childIds is being updated
      let childRelationUpdate = {}
      if (input.childIds !== undefined) {
        // Get all existing video IDs to validate child IDs
        const videos = await prisma.video.findMany({
          select: { id: true }
        })
        const existingVideoIds = new Set(videos.map((video) => video.id))

        // Filter out any child IDs that don't exist
        const validChildIds = (input.childIds || []).filter((id) =>
          existingVideoIds.has(id)
        )

        // Update the children relation
        childRelationUpdate = {
          children: {
            set: validChildIds.map((id) => ({ id }))
          }
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
          ...childRelationUpdate,
          ...(input.keywordIds
            ? { keywords: { set: input.keywordIds.map((id) => ({ id })) } }
            : {})
        },
        include: {
          ...query.include,
          children: true
        }
      })

      // Handle parent variant changes if video published status changed
      if (currentVideo && input.published !== undefined) {
        const wasPublished = currentVideo.published
        const isNowPublished = input.published

        if (
          wasPublished !== isNowPublished &&
          currentVideo.variants.length > 0
        ) {
          try {
            for (const variant of currentVideo.variants) {
              if (isNowPublished) {
                // Video was unpublished and is now published - create parent variants for all published variants
                await handleParentVariantCreation(input.id, variant.languageId)
              } else {
                // Video was published and is now unpublished - cleanup parent variants for all variants
                await handleParentVariantCleanup(input.id, variant.languageId)
              }
            }
          } catch (error) {
            console.error('Parent variant video update error:', error)
          }
        }
      }

      try {
        await updateVideoInAlgolia(video.id)
      } catch (error) {
        console.error('Algolia update error:', error)
      }

        try {
          await videoCacheReset(video.id)
        } catch (error) {
          console.error('Cache reset error:', error)
        }

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
  }),
  videoPublishChildren: t.withAuth({ isPublisher: true }).field({
    type: VideoPublishChildrenResult,
    nullable: false,
    args: {
      id: t.arg.id({ required: true })
    },
    resolve: async (_parent, { id }) => {
      // Fetch parent and children
      const parent = await prisma.video.findUnique({
        where: { id },
        select: {
          id: true,
          publishedAt: true,
          children: {
            select: { id: true, published: true }
          }
        }
      })

      if (parent == null) {
        throw new Error(`Video with id ${id} not found`)
      }

      const childIdsToPublish = parent.children
        .filter((c) => !c.published)
        .map((c) => c.id)

      // Publish parent and unpublished children together
      const now = new Date()
      await prisma.$transaction(async (tx) => {
        await tx.video.update({
          where: { id: parent.id },
          data: {
            published: true,
            publishedAt: parent.publishedAt ?? now
          }
        })

        if (childIdsToPublish.length > 0) {
          await tx.video.updateMany({
            where: { id: { in: childIdsToPublish } },
            data: { published: true, publishedAt: now }
          })
        }
      })

      // For all published child variants, ensure parent has empty variants
      if (childIdsToPublish.length > 0 || parent.publishedAt == null) {
        const publishedChildVariants = await prisma.videoVariant.findMany({
          where: { videoId: { in: parent.children.map((c) => c.id) }, published: true },
          select: { videoId: true, languageId: true }
        })

        await Promise.all(
          publishedChildVariants.map(({ videoId, languageId }) =>
            handleParentVariantCreation(videoId, languageId).catch((error) => {
              console.error('Parent variant creation error:', error)
            })
          )
        )
      }

      try {
        await updateVideoInAlgolia(parent.id)
      } catch (error) {
        console.error('Algolia update error:', error)
      }

      try {
        await videoCacheReset(parent.id)
        // Also reset caches for affected children
        await Promise.all(
          parent.children.map(async (c) => {
            try {
              await videoCacheReset(c.id)
            } catch (error) {
              console.error('Cache reset error:', error)
            }
          })
        )
      } catch (error) {
        console.error('Cache reset error:', error)
      }

      const publishedChildrenCount = childIdsToPublish.length
      return {
        parentId: parent.id,
        publishedChildIds: childIdsToPublish,
        publishedChildrenCount
      }
    }
  }),
  videoPublishChildrenAndLanguages: t.withAuth({ isPublisher: true }).field({
    type: VideoPublishChildrenAndLanguagesResult,
    nullable: false,
    args: {
      id: t.arg.id({ required: true })
    },
    resolve: async (_parent, { id }) => {
      // Fetch parent, children and their unpublished variants
      const parent = await prisma.video.findUnique({
        where: { id },
        select: {
          id: true,
          publishedAt: true,
          children: {
            select: { id: true, published: true }
          }
        }
      })

      if (parent == null) {
        throw new Error(`Video with id ${id} not found`)
      }

      const allChildIds = parent.children.map((c) => c.id)
      const childIdsToPublish = parent.children
        .filter((c) => !c.published)
        .map((c) => c.id)

      // Get unpublished variants across all children
      const unpublishedVariants = await prisma.videoVariant.findMany({
        where: { videoId: { in: allChildIds }, published: false },
        select: { id: true, videoId: true, languageId: true }
      })

      const now = new Date()
      await prisma.$transaction(async (tx) => {
        // Publish parent
        await tx.video.update({
          where: { id: parent.id },
          data: {
            published: true,
            publishedAt: parent.publishedAt ?? now
          }
        })

        // Publish children
        if (childIdsToPublish.length > 0) {
          await tx.video.updateMany({
            where: { id: { in: childIdsToPublish } },
            data: { published: true, publishedAt: now }
          })
        }

        // Publish all unpublished variants for children
        if (unpublishedVariants.length > 0) {
          const unpublishedVariantIds = unpublishedVariants.map((v) => v.id)
          await tx.videoVariant.updateMany({
            where: { id: { in: unpublishedVariantIds } },
            data: { published: true }
          })

          // Update availableLanguages per video to include language if missing
          const updatesByVideo: Record<string, Set<string>> = {}
          for (const v of unpublishedVariants) {
            if (!updatesByVideo[v.videoId]) updatesByVideo[v.videoId] = new Set()
            updatesByVideo[v.videoId].add(v.languageId)
          }
          await Promise.all(
            Object.entries(updatesByVideo).map(async ([videoId, langSet]) => {
              const languageIds = Array.from(langSet)
              for (const languageId of languageIds) {
                await tx.video.update({
                  where: {
                    id: videoId,
                    NOT: { availableLanguages: { has: languageId } }
                  },
                  data: { availableLanguages: { push: languageId } }
                })
              }
            })
          )
        }
      })

      // Ensure parent has empty variants for all published child variant languages
      const variantsToConsider = await prisma.videoVariant.findMany({
        where: { videoId: { in: allChildIds }, published: true },
        select: { videoId: true, languageId: true, id: true }
      })

      await Promise.all(
        variantsToConsider.map(({ videoId, languageId }) =>
          handleParentVariantCreation(videoId, languageId).catch((error) => {
            console.error('Parent variant creation error:', error)
          })
        )
      )

      // Update indices and caches
      try {
        await updateVideoInAlgolia(parent.id)
      } catch (error) {
        console.error('Algolia update error:', error)
      }

      try {
        await videoCacheReset(parent.id)
        await Promise.all(
          allChildIds.map(async (childId) => {
            try {
              await videoCacheReset(childId)
            } catch (error) {
              console.error('Cache reset error:', error)
            }
          })
        )
      } catch (error) {
        console.error('Cache reset error:', error)
      }

      // Update variant indices and caches
      await Promise.all(
        variantsToConsider.map(async ({ id: variantId, videoId }) => {
          try {
            await updateVideoVariantInAlgolia(variantId)
          } catch (error) {
            console.error('Algolia update error:', error)
          }
          try {
            void videoVariantCacheReset(variantId)
            void videoCacheReset(videoId)
          } catch (error) {
            console.error('Cache reset error:', error)
          }
        })
      )

      return {
        parentId: parent.id,
        publishedChildIds: childIdsToPublish,
        publishedChildrenCount: childIdsToPublish.length,
        publishedVariantIds: unpublishedVariants.map((v) => v.id),
        publishedVariantsCount: unpublishedVariants.length
      }
    }
  })
}))
