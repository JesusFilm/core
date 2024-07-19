import isEmpty from 'lodash/isEmpty'

import { Prisma } from '.prisma/api-videos-client'

import { prisma } from '../../lib/prisma'
import { builder } from '../builder'

import { Language } from './language'
import { LanguageWithSlug } from './languagesWithSlug'
import { VideoDescription } from './videoDescription'
import { VideoImageAlt } from './videoImageAlt'
import { VideoSnippet } from './videoSnippet'
import { VideoStudyQuestion } from './videoStudyQuestion'
import { VideoTitle } from './videoTitle'
import { VideoVariant } from './videoVariant'

import './bibleCitation'
import './bibleBook'

enum IdType {
  databaseId = 'databaseId',
  slug = 'slug'
}

enum VideoLabel {
  collection = 'collection',
  episode = 'episode',
  featureFilm = 'featureFilm',
  segment = 'segment',
  series = 'series',
  shortFilm = 'shortFilm',
  trailer = 'trailer',
  behindTheScenes = 'behindTheScenes'
}

builder.enumType(IdType, { name: 'IdType' })
builder.enumType(VideoLabel, { name: 'VideoLabel' })

const VideosFilter = builder.inputType('VideosFilter', {
  fields: (t) => ({
    availableVariantLanguageIds: t.field({
      type: ['ID']
    }),
    title: t.field({
      type: 'String'
    }),
    labels: t.field({
      type: [VideoLabel]
    }),
    ids: t.field({
      type: ['ID']
    }),
    subtitleLanguageIds: t.field({
      type: ['ID']
    })
  })
})

function videoFilter(
  filter: typeof VideosFilter.$inferInput = {}
): Prisma.VideoWhereInput {
  const {
    title,
    availableVariantLanguageIds,
    labels,
    ids,
    subtitleLanguageIds
  } = filter

  return {
    title:
      title != null
        ? { some: { value: { search: this.parseFullTextSearch(title) } } }
        : undefined,
    variants:
      availableVariantLanguageIds != null || subtitleLanguageIds != null
        ? {
            some: {
              subtitle:
                subtitleLanguageIds != null
                  ? { some: { languageId: { in: subtitleLanguageIds } } }
                  : undefined,
              languageId:
                availableVariantLanguageIds != null
                  ? { in: availableVariantLanguageIds }
                  : undefined
            }
          }
        : undefined,
    label: labels != null ? { in: labels } : undefined,
    id: ids != null ? { in: ids } : undefined
  }
}

export const Video = builder.prismaObject('Video', {
  shareable: true,
  fields: (t) => ({
    id: t.exposeID('id'),
    label: t.field({
      type: VideoLabel,
      resolve: (parent) => VideoLabel[parent.label]
    }),
    primaryLanguageId: t.exposeID('primaryLanguageId'),
    image: t.exposeString('image', { nullable: true }),
    slug: t.field({
      type: 'String',
      resolve: async (parent) => parent.slug ?? ''
    }),
    noIndex: t.exposeBoolean('noIndex', { nullable: true }),
    children: t.relation('children'),
    bibleCitation: t.relation('bibleCitation', { nullable: true }),
    childrenCount: t.field({
      type: 'Int',
      resolve: async (parent) =>
        await prisma.video.count({
          where: { parent: { some: { id: parent.id } } }
        })
    }),
    title: t.prismaField({
      type: [VideoTitle],
      args: {
        languageId: t.arg.id({ required: false }),
        primary: t.arg.boolean({ required: false })
      },
      resolve: async (query, language, { languageId, primary }) => {
        const where: Prisma.VideoTitleWhereInput = {
          videoId: language.id,
          OR: languageId == null && primary == null ? undefined : []
        }
        if (languageId != null) where.OR?.push({ languageId })
        if (primary != null) where.OR?.push({ primary })
        return await prisma.videoTitle.findMany({
          ...query,
          where,
          orderBy: { primary: 'desc' }
        })
      }
    }),
    snippet: t.prismaField({
      type: [VideoSnippet],
      args: {
        languageId: t.arg.id({ required: false }),
        primary: t.arg.boolean({ required: false })
      },
      resolve: async (query, language, { languageId, primary }) => {
        const where: Prisma.VideoSnippetWhereInput = {
          videoId: language.id,
          OR: languageId == null && primary == null ? undefined : []
        }
        if (languageId != null) where.OR?.push({ languageId })
        if (primary != null) where.OR?.push({ primary })
        return await prisma.videoSnippet.findMany({
          ...query,
          where,
          orderBy: { primary: 'desc' }
        })
      }
    }),
    description: t.prismaField({
      type: [VideoDescription],
      args: {
        languageId: t.arg.id({ required: false }),
        primary: t.arg.boolean({ required: false })
      },
      resolve: async (query, language, { languageId, primary }) => {
        const where: Prisma.VideoDescriptionWhereInput = {
          videoId: language.id,
          OR: languageId == null && primary == null ? undefined : []
        }
        if (languageId != null) where.OR?.push({ languageId })
        if (primary != null) where.OR?.push({ primary })
        return await prisma.videoDescription.findMany({
          ...query,
          where,
          orderBy: { primary: 'desc' }
        })
      }
    }),
    studyQuestions: t.prismaField({
      type: [VideoStudyQuestion],
      args: {
        languageId: t.arg.id({ required: false }),
        primary: t.arg.boolean({ required: false })
      },
      resolve: async (query, language, { languageId, primary }) => {
        const where: Prisma.VideoStudyQuestionWhereInput = {
          videoId: language.id,
          OR: languageId == null && primary == null ? undefined : []
        }
        if (languageId != null) where.OR?.push({ languageId })
        if (primary != null) where.OR?.push({ primary })
        return await prisma.videoStudyQuestion.findMany({
          ...query,
          where,
          orderBy: { order: 'asc' }
        })
      }
    }),
    imageAlt: t.prismaField({
      type: [VideoImageAlt],
      args: {
        languageId: t.arg.id({ required: false }),
        primary: t.arg.boolean({ required: false })
      },
      resolve: async (query, language, { languageId, primary }) => {
        const where: Prisma.VideoImageAltWhereInput = {
          videoId: language.id,
          OR: languageId == null && primary == null ? undefined : []
        }
        if (languageId != null) where.OR?.push({ languageId })
        if (primary != null) where.OR?.push({ primary })
        return await prisma.videoImageAlt.findMany({
          ...query,
          where,
          orderBy: { primary: 'desc' }
        })
      }
    }),
    variant: t.prismaField({
      type: VideoVariant,
      nullable: true,
      args: {
        languageId: t.arg.id({ required: false })
      },
      resolve: async (query, parent, { languageId }, _ctx, info) => {
        console.log('info', info)
        const variableValueId =
          (info.variableValues.id as string) ??
          (info.variableValues.contentId as string) ??
          ''
        const requestedLanguage = variableValueId.includes('/')
          ? variableValueId.substring(variableValueId.lastIndexOf('/') + 1)
          : ''

        const journeysLanguageIdForBlock = (
          info.variableValues as {
            representations: Array<{ primaryLanguageId: string }>
          }
        ).representations?.[0].primaryLanguageId

        if (
          info.variableValues.idType !== IdType.databaseId &&
          !isEmpty(variableValueId) &&
          !isEmpty(requestedLanguage)
        ) {
          const slug = `${parent.slug as string}/${requestedLanguage}`
          return await prisma.videoVariant.findUnique({
            where: {
              slug
            }
          })
        }

        languageId = languageId ?? journeysLanguageIdForBlock ?? '529'
        return await prisma.videoVariant.findUnique({
          ...query,
          where: {
            languageId_videoId: {
              videoId: parent.id,
              languageId
            }
          }
        })
      }
    }),
    variantLanguages: t.field({
      type: [Language],
      resolve: async (parent) =>
        (
          await prisma.videoVariant.findMany({
            where: { videoId: parent.id },
            select: { languageId: true }
          })
        ).map(({ languageId }) => ({ id: languageId }))
    }),
    variantLanguagesCount: t.field({
      type: 'Int',
      resolve: async (parent) =>
        await prisma.videoVariant.count({
          where: { videoId: parent.id }
        })
    }),
    variantLanguagesWithSlug: t.field({
      type: [LanguageWithSlug],
      resolve: async (parent) =>
        (
          await prisma.videoVariant.findMany({
            where: { videoId: parent.id },
            select: { languageId: true, slug: true }
          })
        ).map(({ slug, languageId }) => ({
          slug,
          language: { id: languageId }
        }))
    })
  })
})

builder.asEntity(Video, {
  key: builder.selection<{ id: string }>('id'),
  resolveReference: async ({ id }) =>
    await prisma.video.findUnique({ where: { id } })
})

builder.queryFields((t) => ({
  video: t.prismaField({
    type: 'Video',
    nullable: true,
    args: {
      id: t.arg.id({ required: true }),
      idType: t.arg({
        type: IdType,
        defaultValue: IdType.databaseId
      })
    },
    resolve: async (query, _parent, { id, idType }) =>
      idType === IdType.slug
        ? prisma.video.findFirst({
            ...query,
            where: { slug: id }
          })
        : prisma.video.findUnique({
            ...query,
            where: { id }
          })
  }),
  videos: t.prismaField({
    type: ['Video'],
    nullable: false,
    args: {
      offset: t.arg.int({ required: false }),
      limit: t.arg.int({ required: false }),
      where: t.arg({ type: VideosFilter, required: false })
    },
    resolve: async (query, _parent, { offset, limit, where }) => {
      const search = videoFilter({
        title: where?.title ?? undefined,
        availableVariantLanguageIds:
          where?.availableVariantLanguageIds ?? undefined,
        ids: where?.ids ?? undefined,
        labels: where?.labels ?? undefined,
        subtitleLanguageIds: where?.subtitleLanguageIds ?? undefined
      })
      return await prisma.video.findMany({
        ...query,
        where: search,
        skip: offset ?? 0,
        take: limit ?? 100
      })
    }
  })
}))
