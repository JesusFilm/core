import { Prisma } from '.prisma/api-languages-client'

import { prisma } from '../../lib/prisma'
import { builder } from '../builder'

enum LanguageIdType {
  databaseId = 'databaseId',
  bcp47 = 'bcp47'
}

builder.enumType(LanguageIdType, { name: 'LanguageIdType' })

const LanguagesFilter = builder.inputType('LanguagesFilter', {
  fields: (t) => ({
    ids: t.field({
      type: ['ID']
    })
  })
})

builder.prismaObject('AudioPreview', {
  fields: (t) => ({
    language: t.relation('language', { nullable: false }),
    value: t.exposeString('value', { nullable: false }),
    duration: t.exposeInt('duration', { nullable: false }),
    size: t.exposeInt('size', { nullable: false }),
    bitrate: t.exposeInt('bitrate', { nullable: false }),
    codec: t.exposeString('codec', { nullable: false })
  })
})

builder.prismaObject('LanguageName', {
  fields: (t) => ({
    value: t.exposeString('value', { nullable: false }),
    primary: t.exposeBoolean('primary', { nullable: false }),
    language: t.relation('language', { nullable: false })
  })
})

export const Language = builder.prismaObject('Language', {
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    bcp47: t.exposeString('bcp47'),
    iso3: t.exposeString('iso3'),
    slug: t.exposeString('slug'),
    name: t.relation('name', {
      nullable: false,
      args: {
        languageId: t.arg.id({ required: false }),
        primary: t.arg.boolean({ required: false })
      },
      query: ({ languageId, primary }) => {
        const where: Prisma.LanguageNameWhereInput = {
          OR:
            languageId == null && primary == null
              ? [{ languageId: '529' }, { primary: true }]
              : []
        }
        if (languageId != null) where.OR?.push({ languageId })
        if (primary != null) where.OR?.push({ primary })
        return {
          where,
          orderBy: { primary: 'desc' }
        }
      }
    }),
    countryLanguages: t.relation('countryLanguages', { nullable: false }),
    audioPreview: t.relation('audioPreview'),
    primaryCountryId: t.string({
      resolve: async (parent) => {
        const primaryCountryLanguage = await prisma.countryLanguage.findFirst({
          where: {
            languageId: parent.id,
            primary: true
          },
          orderBy: {
            speakers: 'desc'
          }
        })
        return primaryCountryLanguage?.countryId ?? null
      }
    }),
    speakerCount: t.int({
      nullable: false,
      resolve: async (parent) => {
        const result = await prisma.countryLanguage.aggregate({
          where: { languageId: parent.id },
          _sum: { speakers: true }
        })
        return result._sum.speakers ?? 0
      }
    }),
    countriesCount: t.int({
      nullable: false,
      resolve: async (parent) => {
        return await prisma.countryLanguage.count({
          where: { languageId: parent.id }
        })
      }
    })
  })
})

builder.asEntity(Language, {
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
        ? await prisma.language.findFirst({
            ...query,
            where: { bcp47: id }
          })
        : await prisma.language.findUnique({
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
      const filter: Prisma.LanguageWhereInput = {
        hasVideos: true
      }
      if (where?.ids != null) filter.id = { in: where?.ids }
      return await prisma.language.findMany({
        ...query,
        where: filter,
        skip: offset ?? undefined,
        take: limit ?? undefined
      })
    }
  }),

  languagesCount: t.int({
    nullable: false,
    args: { where: t.arg({ type: LanguagesFilter, required: false }) },
    resolve: async (_parent, { where }) => {
      const filter: Prisma.LanguageWhereInput = {
        hasVideos: true
      }
      if (where?.ids != null) filter.id = { in: where.ids }
      return await prisma.language.count({
        where: filter
      })
    }
  })
}))
