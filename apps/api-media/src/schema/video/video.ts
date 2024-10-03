import compact from 'lodash/compact'
import isEmpty from 'lodash/isEmpty'
import orderBy from 'lodash/orderBy'

import { prisma } from '../../lib/prisma'
import { builder } from '../builder'
import { ImageAspectRatio } from '../cloudflare/image/enums'
import { IdType, IdTypeShape } from '../enums/idType'
import { Language, LanguageWithSlug } from '../language'

import { VideoLabel } from './enums/videoLabel'
import { VideosFilter } from './inputs/videosFilter'
import { videosFilter } from './lib/videosFilter'

const Video = builder.prismaObject('Video', {
  shareable: true,
  fields: (t) => ({
    bibleCitations: t.relation('bibleCitation'),
    keywords: t.relation('keywords', {
      args: { languageId: t.arg.id({ required: false }) },
      query: ({ languageId }) => ({
        where: { languageId: languageId ?? '529' }
      })
    }),
    id: t.exposeID('id'),
    label: t.expose('label', { type: VideoLabel }),
    primaryLanguageId: t.exposeID('primaryLanguageId'),
    published: t.exposeBoolean('published'),
    title: t.relation('title', {
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
    image: t.exposeString('image', { nullable: true }),
    imageAlt: t.relation('imageAlt', {
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
    videoStill: t.exposeString('videoStill', { nullable: true }),
    thumbnail: t.exposeString('thumbnail', { nullable: true }),
    mobileCinematicHigh: t.exposeString('mobileCinematicHigh', {
      nullable: true
    }),
    mobileCinematicLow: t.exposeString('mobileCinematicLow', {
      nullable: true
    }),
    mobileCinematicVeryLow: t.exposeString('mobileCinematicVeryLow', {
      nullable: true
    }),

    variantLanguages: t.field({
      type: [Language],
      resolve: async ({ id: videoId }) =>
        (
          await prisma.videoVariant.findMany({
            where: { videoId },
            select: { languageId: true }
          })
        ).map(({ languageId }) => ({ id: languageId }))
    }),
    variantLanguagesCount: t.int({
      resolve: async ({ id: videoId }) =>
        await prisma.videoVariant.count({ where: { videoId } })
    }),
    slug: t.string({
      resolve: ({ slug }) => slug ?? '',
      description: 'slug is a permanent link to the video.'
    }),
    noIndex: t.exposeBoolean('noIndex', { nullable: true }),
    children: t.prismaField({
      type: ['Video'],
      async resolve(query, parent) {
        return orderBy(
          await prisma.video.findMany({
            ...query,
            where: {
              parent: { some: { id: parent.id } }
            }
          }),
          ({ id }) => parent.childIds.indexOf(id),
          'asc'
        )
      }
    }),
    childrenCount: t.int({
      resolve: async ({ id }) =>
        await prisma.video.count({ where: { parent: { some: { id } } } }),
      description: 'the number value of the amount of children on a video'
    }),
    variantLanguagesWithSlug: t.field({
      type: [LanguageWithSlug],
      resolve: async ({ id: videoId }) =>
        (
          await prisma.videoVariant.findMany({
            where: { videoId },
            select: { languageId: true, slug: true }
          })
        ).map(({ slug, languageId: id }) => ({
          slug,
          language: { id }
        }))
    }),
    variants: t.prismaField({
      type: ['VideoVariant'],
      resolve: async (query, parent) =>
        await prisma.videoVariant.findMany({
          ...query,
          where: { videoId: parent.id }
        })
    }),
    subtitles: t.relation('subtitles', {
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
      nullable: true,
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

        const journeysLanguageIdForBlock = (
          info.variableValues as {
            representations: Array<{ id: string; primaryLanguageId: string }>
          }
        ).representations?.find(({ id }) => id === parent.id)?.primaryLanguageId

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
  adminVideo: t.prismaField({
    type: 'Video',
    args: {
      id: t.arg.id({ required: true }),
      idType: t.arg({
        type: IdType,
        defaultValue: IdTypeShape.databaseId
      })
    },
    authScopes: {
      isPublisher: true
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
  adminVideos: t.prismaField({
    type: ['Video'],
    args: {
      where: t.arg({ type: VideosFilter, required: false }),
      offset: t.arg.int({ required: false }),
      limit: t.arg.int({ required: false })
    },
    authScopes: {
      isPublisher: true
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
  video: t.prismaField({
    type: 'Video',
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
            where: { variants: { some: { slug: id } }, published: true }
          })
        : await prisma.video.findUniqueOrThrow({
            ...query,
            where: { id, published: true }
          })
    }
  }),
  videos: t.prismaField({
    type: ['Video'],
    args: {
      where: t.arg({ type: VideosFilter, required: false }),
      offset: t.arg.int({ required: false }),
      limit: t.arg.int({ required: false })
    },
    resolve: async (query, _parent, { offset, limit, where }) => {
      const filter = videosFilter(where ?? {})
      filter.published = true
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
    resolve: async (_parent, { where }) => {
      const filter = videosFilter(where ?? {})
      filter.published = true
      return await prisma.video.count({
        where: filter
      })
    }
  })
}))
