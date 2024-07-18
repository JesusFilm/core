import { Prisma } from '.prisma/api-videos-client'

import { prisma } from '../../lib/prisma'

import { builder } from '../builder'

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

const Language = builder
  .externalRef('Language', builder.selection<{ id: string }>('id'))
  .implement({
    externalFields: (t) => ({
      id: t.id()
    })
  })

const BibleBookName = builder.prismaObject('BibleBookName', {
  fields: (t) => ({
    value: t.exposeString('value'),
    primary: t.exposeBoolean('primary'),
    language: t.field({
      type: Language,
      resolve: (parent) => ({ id: parent.languageId })
    })
  })
})

export const BibleBook = builder.prismaObject('BibleBook', {
  fields: (t) => ({
    osisId: t.exposeString('osisId'),
    alternateName: t.exposeString('alternateName', { nullable: true }),
    paratextAbbreviation: t.exposeString('paratextAbbreviation'),
    isNewTestament: t.exposeBoolean('isNewTestament'),
    order: t.exposeInt('order'),
    name: t.prismaField({
      type: [BibleBookName],
      args: {
        languageId: t.arg.id({ required: false }),
        primary: t.arg.boolean({ required: false })
      },
      resolve: async (query, language, { languageId, primary }) => {
        const where: Prisma.BibleBookNameWhereInput = {
          bibleBookId: language.id,
          OR: languageId == null && primary == null ? undefined : []
        }
        if (languageId != null) where.OR?.push({ languageId })
        if (primary != null) where.OR?.push({ primary })
        return await prisma.bibleBookName.findMany({
          ...query,
          where,
          orderBy: { primary: 'desc' }
        })
      }
    })
  })
})

const BibleCitation = builder.prismaObject('BibleCitation', {
  fields: (t) => ({
    osisId: t.exposeString('osisId'),
    bibleBook: t.relation('bibleBook'),
    chapterStart: t.exposeInt('chapterStart'),
    chapterEnd: t.exposeInt('chapterEnd', { nullable: true }),
    verseStart: t.exposeInt('verseStart'),
    verseEnd: t.exposeInt('verseEnd', { nullable: true })
  })
})

const VideoTitle = builder.prismaObject('VideoTitle', {
  fields: (t) => ({
    value: t.exposeString('value'),
    primary: t.exposeBoolean('primary'),
    language: t.field({
      type: Language,
      resolve: (parent) => ({ id: parent.languageId })
    })
  })
})

export const Video = builder.prismaObject('Video', {
  fields: (t) => ({
    id: t.exposeID('id'),
    bcp47: t.exposeString('bcp47', { nullable: true }),
    iso3: t.exposeString('iso3', { nullable: true }),
    name: t.prismaField({
      type: [LanguageName],
      args: {
        languageId: t.arg.id({ required: false }),
        primary: t.arg.boolean({ required: false })
      },
      resolve: async (query, language, { languageId, primary }) => {
        const where: Prisma.LanguageNameWhereInput = {
          parentLanguageId: language.id,
          OR: languageId == null && primary == null ? undefined : []
        }
        if (languageId != null) where.OR?.push({ languageId })
        if (primary != null) where.OR?.push({ primary })
        return await prisma.languageName.findMany({
          ...query,
          where,
          orderBy: { primary: 'desc' },
          include: { language: true }
        })
      }
    }),
    countries: t.relation('countries'),
    audioPreview: t.relation('audioPreview', { nullable: true })
  })
})

builder.asEntity(Video, {
  key: builder.selection<{ id: string }>('id'),
  resolveReference: async ({ id }) =>
    await prisma.language.findUnique({ where: { id } })
})

builder.queryFields((t) => ({
  language: t.prismaField({
    type: 'Language',
    nullable: true,
    args: {
      id: t.arg.id({ required: true }),
      idType: t.arg({
        type: LanguageIdType,
        defaultValue: LanguageIdType.databaseId
      })
    },
    resolve: async (query, _parent, { id, idType }) =>
      idType === LanguageIdType.bcp47
        ? prisma.language.findFirst({
            ...query,
            where: { bcp47: id }
          })
        : prisma.language.findUnique({
            ...query,
            where: { id }
          })
  }),
  languages: t.prismaField({
    type: ['Language'],
    nullable: false,
    args: {
      offset: t.arg.int({ required: false }),
      limit: t.arg.int({ required: false }),
      where: t.arg({ type: LanguagesFilter, required: false })
    },
    resolve: async (query, _parent, { offset, limit, where }) => {
      const filter: Prisma.LanguageWhereInput = {}
      if (where?.ids != null) filter.id = { in: where?.ids }
      return await prisma.language.findMany({
        ...query,
        where: filter,
        skip: offset ?? undefined,
        take: limit ?? undefined
      })
    }
  })
}))
