import { Prisma } from '.prisma/api-languages-client'

import { db } from '../db'

import { builder } from './builder'

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

const Translation = builder.prismaObject('LanguageName', {
  name: 'Translation',
  shareable: true,
  fields: (t) => ({
    primary: t.exposeBoolean('primary'),
    value: t.exposeString('value'),
    language: t.relation('language', { type: Language })
  })
})

export const Language = builder.prismaObject('Language', {
  fields: (t) => ({
    id: t.exposeID('id'),
    bcp47: t.exposeString('bcp47', { nullable: true }),
    iso3: t.exposeString('iso3', { nullable: true }),
    name: t.relation('name', {
      type: Translation,
      args: {
        languageId: t.arg.id({ required: false }),
        primary: t.arg.boolean({ required: false })
      },
      query: ({ languageId, primary }, context) => {
        const where: Prisma.LanguageNameWhereInput = {
          //   parentLanguageId: language.id,
          OR: languageId == null && primary == null ? undefined : []
        }
        if (languageId != null) where.OR?.push({ languageId })
        if (primary != null) where.OR?.push({ primary })
        return {
          where,
          orderBy: { primary: 'desc' }
        }
      }
    })
  })
})

builder.asEntity(Language, {
  key: builder.selection<{ id: string }>('id'),
  resolveReference: async ({ id }) =>
    await db.language.findUnique({ where: { id } })
})

builder.queryType({
  fields: (t) => ({
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
      resolve: async (
        query: {
          include?: Prisma.LanguageInclude
          select?: Prisma.LanguageSelect
        },
        root,
        { id, idType }
      ) =>
        idType === LanguageIdType.bcp47
          ? await db.language.findFirst({
              ...query,
              where: { bcp47: id }
            })
          : await db.language.findUnique({
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
      resolve: async (
        query: {
          include?: Prisma.LanguageInclude
          select?: Prisma.LanguageSelect
        },
        root,
        { offset, limit, where }
      ) => {
        const filter: Prisma.LanguageWhereInput = {}
        if (where?.ids != null) filter.id = { in: where?.ids }
        return await db.language.findMany({
          ...query,
          where: filter,
          skip: offset ?? undefined,
          take: limit ?? undefined
        })
      }
    })
  })
})
