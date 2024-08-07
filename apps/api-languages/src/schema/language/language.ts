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

export const AudioPreview = builder.prismaObject('AudioPreview', {
  fields: (t) => ({
    language: t.relation('language'),
    value: t.exposeString('value'),
    duration: t.exposeInt('duration'),
    size: t.exposeInt('size')
  })
})

const LanguageName = builder.prismaObject('LanguageName', {
  fields: (t) => ({
    value: t.exposeString('value'),
    primary: t.exposeBoolean('primary'),
    language: t.relation('language')
  })
})

export const Language = builder.prismaObject('Language', {
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
          OR:
            languageId == null && primary == null
              ? [{ languageId: '529' }, { primary: true }]
              : []
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
    countryLanguages: t.relation('countryLanguages'),
    audioPreview: t.relation('audioPreview', { nullable: true })
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
  })
}))
