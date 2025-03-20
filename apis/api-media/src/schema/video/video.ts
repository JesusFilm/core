import { ResultOf } from 'gql.tada'
import { GraphQLError } from 'graphql'
import { GraphQLClient } from 'graphql-request'
import compact from 'lodash/compact'
import isEmpty from 'lodash/isEmpty'
import orderBy from 'lodash/orderBy'

import { Prisma, Video as PrismaVideo } from '.prisma/api-media-client'

import { prisma } from '../../lib/prisma'
import { logger } from '../../logger'
import { builder } from '../builder'
import { ImageAspectRatio } from '../cloudflare/image/enums'
import { IdType, IdTypeShape } from '../enums/idType'
import { Language, LanguageWithSlug } from '../language'
import { VideoSource, VideoSourceShape } from '../videoSource/videoSource'
import { VideoVariantFilter } from '../videoVariant/inputs/videoVariantFilter'

import { VideoLabel } from './enums/videoLabel'
import { VideoCreateInput } from './inputs/videoCreate'
import { VideosFilter } from './inputs/videosFilter'
import { VideoUpdateInput } from './inputs/videoUpdate'
import { GetVideoQuery } from './lib/productionQuery'
import { videosFilter } from './lib/videosFilter'

const productionClient = new GraphQLClient(
  process.env.PRODUCTION_GRAPHQL_URL ?? ''
)

interface VideoFallbackOptions {
  skipProduction?: boolean
  context?: any
}

async function withVideoFallback<T>(
  videoId: string,
  localData: T | null,
  options: VideoFallbackOptions = {}
): Promise<T | null> {
  // Skip if we're in production
  if (process.env.DEPLOYMENT_ENV === 'prod') {
    return localData
  }

  // Skip if we have local data
  if (localData !== null) {
    return localData
  }

  // Skip if explicitly requested
  if (options.skipProduction) {
    return localData
  }

  try {
    const prodData = await productionClient.request(GetVideoQuery, {
      id: videoId
    })

    if (!prodData.video) {
      return null
    }

    // Store the video and its relations in the local database
    const video = await prisma.$transaction(async (tx) => {
      // Create the main video
      const video = await tx.video.create({
        data: {
          id: prodData.video.id,
          label: prodData.video.label,
          locked: prodData.video.locked,
          primaryLanguageId: prodData.video.primaryLanguageId,
          published: prodData.video.published,
          availableLanguages: prodData.video.availableLanguages,
          childIds: [] // Initialize empty as we don't get this from prod
        }
      })

      // Create bible citations
      if (prodData.video.bibleCitations.length > 0) {
        await tx.bibleCitation.createMany({
          data: prodData.video.bibleCitations.map((citation) => ({
            id: citation.id,
            videoId: video.id,
            bibleBookId: citation.bibleBookId,
            osisId: citation.osisId,
            chapterStart: citation.chapterStart,
            chapterEnd: citation.chapterEnd,
            verseStart: citation.verseStart,
            verseEnd: citation.verseEnd,
            order: citation.order
          }))
        })
      }

      // Create titles
      if (prodData.video.title.length > 0) {
        await tx.videoTitle.createMany({
          data: prodData.video.title.map((title) => ({
            id: title.id,
            videoId: video.id,
            value: title.value,
            primary: title.primary,
            languageId: title.languageId
          }))
        })
      }

      // Create descriptions
      if (prodData.video.description.length > 0) {
        await tx.videoDescription.createMany({
          data: prodData.video.description.map((desc) => ({
            id: desc.id,
            videoId: video.id,
            value: desc.value,
            primary: desc.primary,
            languageId: desc.languageId
          }))
        })
      }

      // Create study questions
      if (prodData.video.studyQuestions.length > 0) {
        await tx.videoStudyQuestion.createMany({
          data: prodData.video.studyQuestions.map((question) => ({
            id: question.id,
            videoId: video.id,
            value: question.value,
            primary: question.primary,
            languageId: question.languageId,
            order: question.order,
            crowdInId: question.crowdInId
          }))
        })
      }

      // Create variants
      for (const variant of prodData.video.variants) {
        const createdVariant = await tx.videoVariant.create({
          data: {
            id: variant.id,
            videoId: video.id,
            slug: variant.slug,
            duration: variant.duration,
            hls: variant.hls,
            languageId: variant.languageId,
            published: variant.published,
            edition: variant.edition
          }
        })

        // Create variant downloads
        if (variant.downloads?.length > 0) {
          await tx.videoVariantDownload.createMany({
            data: variant.downloads.map((download) => ({
              id: download.id,
              videoVariantId: createdVariant.id,
              quality: download.quality,
              size: download.size,
              url: download.url,
              height: download.height,
              width: download.width,
              version: download.version ?? 1
            }))
          })
        }
      }

      // Create cloudflare assets
      if (prodData.video.cloudflareAssets.length > 0) {
        await tx.cloudflareImage.createMany({
          data: prodData.video.cloudflareAssets.map((asset) => ({
            id: asset.id,
            url: asset.url,
            height: asset.height,
            width: asset.width,
            videoId: asset.videoId,
            aspectRatio: asset.aspectRatio,
            userId: 'prod', // Required field
            uploaded: true // Required field
          }))
        })
      }

      // Create video editions
      if (prodData.video.videoEditions.length > 0) {
        await tx.videoEdition.createMany({
          data: prodData.video.videoEditions.map((edition) => ({
            id: edition.id,
            name: edition.name,
            videoId: edition.videoId
          }))
        })
      }

      // Create subtitles
      if (prodData.video.subtitles.length > 0) {
        await tx.videoSubtitle.createMany({
          data: prodData.video.subtitles.map((subtitle) => ({
            id: subtitle.id,
            videoId: video.id,
            edition: subtitle.edition,
            vttSrc: subtitle.vttSrc,
            srtSrc: subtitle.srtSrc,
            primary: subtitle.primary,
            languageId: subtitle.languageId,
            vttVersion: subtitle.vttVersion ?? 1,
            srtVersion: subtitle.srtVersion ?? 1
          }))
        })
      }

      return video
    })

    return video as T
  } catch (error) {
    logger.error('Failed to fetch video from production:', { error, videoId })
    return null
  }
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
    label: t.field({
      type: VideoLabel,
      nullable: false,
      resolve: (video) => video.label as unknown as typeof VideoLabel
    }),
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
      async resolve(query, parent) {
        if (parent.childIds.length === 0) return []
        return orderBy(
          await prisma.video.findMany({
            ...query,
            where: {
              id: { in: parent.childIds }
            }
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
      async resolve(query, child: { id: string }) {
        return await prisma.video.findMany({
          ...query,
          where: {
            childIds: {
              has: child.id
            }
          }
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
    })
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
    resolve: async (query, _parent, { id, idType }) => {
      try {
        const localVideo =
          idType === IdTypeShape.slug
            ? await prisma.video.findFirst({
                ...query,
                where: { variants: { some: { slug: id } }, published: true }
              })
            : await prisma.video.findUnique({
                ...query,
                where: { id, published: true }
              })

        // If using slug, we need to get the actual video id
        const videoId =
          localVideo?.id ?? (idType === IdTypeShape.databaseId ? id : null)

        if (!videoId) {
          throw new GraphQLError(`Video not found with id ${idType}:${id}`)
        }

        const result = await withVideoFallback<PrismaVideo>(videoId, localVideo)

        if (!result) {
          throw new GraphQLError(`Video not found with id ${idType}:${id}`)
        }

        return result
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
    resolve: async (query, _parent, { offset, limit, where }) => {
      const filter = videosFilter(where ?? {})
      filter.published = true

      const localVideos = await prisma.video.findMany({
        ...query,
        where: filter,
        skip: offset ?? 0,
        take: limit ?? 100
      })

      // Only fetch from production if we got no results locally
      if (localVideos.length === 0) {
        return (
          (await withVideoFallback('Video', localVideos, {
            skipProduction: true
          })) ?? []
        )
      }

      return localVideos
    }
  }),
  videosCount: t.int({
    args: { where: t.arg({ type: VideosFilter, required: false }) },
    nullable: false,
    resolve: async (_parent, { where }) => {
      const filter = videosFilter(where ?? {})
      filter.published = true
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
      return await prisma.video.create({
        ...query,
        data: input
      })
    }
  }),
  videoUpdate: t.withAuth({ isPublisher: true }).prismaField({
    type: 'Video',
    nullable: false,
    args: {
      input: t.arg({ type: VideoUpdateInput, required: true })
    },
    resolve: async (query, _parent, { input }) => {
      return await prisma.video.update({
        ...query,
        where: { id: input.id },
        data: {
          label: input.label ?? undefined,
          primaryLanguageId: input.primaryLanguageId ?? undefined,
          published: input.published ?? undefined,
          slug: input.slug ?? undefined,
          noIndex: input.noIndex ?? undefined,
          childIds: input.childIds ?? undefined
        },
        include: {
          ...query.include,
          children: true
        }
      })
    }
  })
}))
