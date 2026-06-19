import { Prisma, prisma } from '@core/prisma/languages/client'

import { DateTimeFilter, builder, toPrismaDateTimeFilter } from '../builder'

enum LanguageIdType {
  databaseId = 'databaseId',
  bcp47 = 'bcp47'
}

builder.enumType(LanguageIdType, { name: 'LanguageIdType' })

const LanguagesFilter = builder.inputType('LanguagesFilter', {
  fields: (t) => ({
    ids: t.field({
      type: ['ID']
    }),
    bcp47: t.field({
      type: ['String']
    }),
    iso3: t.field({
      type: ['String']
    }),
    hasVideos: t.boolean({ required: false }),
    updatedAt: t.field({ type: DateTimeFilter, required: false })
  })
})

const AdminLanguagesFilter = builder.inputType('AdminLanguagesFilter', {
  fields: (t) => ({
    ids: t.field({
      type: ['ID']
    }),
    bcp47: t.field({
      type: ['String']
    }),
    iso3: t.field({
      type: ['String']
    }),
    hasVideos: t.boolean({ required: false }),
    updatedAt: t.field({ type: DateTimeFilter, required: false })
  })
})

builder.prismaObject('LanguageName', {
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    value: t.exposeString('value', { nullable: false }),
    languageId: t.exposeString('languageId', { nullable: false }),
    primary: t.exposeBoolean('primary', { nullable: false }),
    language: t.relation('language', { nullable: false })
  })
})

const LanguageNameUpdateInput = builder.inputType('LanguageNameUpdateInput', {
  fields: (t) => ({
    languageId: t.id({ required: true }),
    nameLanguageId: t.id({ required: false }),
    value: t.string({ required: true })
  })
})

const LanguageUpdateInput = builder.inputType('LanguageUpdateInput', {
  fields: (t) => ({
    id: t.id({ required: true }),
    bcp47: t.string({ required: false }),
    iso3: t.string({ required: false })
  })
})

function optionalString(
  value: string | null | undefined
): string | null | undefined {
  if (value === undefined) return undefined
  const trimmed = value?.trim() ?? ''
  return trimmed.length > 0 ? trimmed : null
}

function languageWhereInput(
  where:
    | typeof LanguagesFilter.$inferInput
    | typeof AdminLanguagesFilter.$inferInput
    | null
    | undefined,
  term: string | null | undefined,
  defaultHasVideos?: boolean
): Prisma.LanguageWhereInput {
  const filter: Prisma.LanguageWhereInput = {}
  if (where?.ids != null) filter.id = { in: where.ids }
  if (where?.bcp47 != null) filter.bcp47 = { in: where.bcp47 }
  if (where?.iso3 != null) filter.iso3 = { in: where.iso3 }
  filter.hasVideos = where?.hasVideos ?? defaultHasVideos
  filter.updatedAt = toPrismaDateTimeFilter(where?.updatedAt)

  const searchTerm = term?.trim()
  if (searchTerm != null && searchTerm.length > 0) {
    filter.OR = [
      { id: { startsWith: searchTerm } },
      {
        name: {
          some: {
            value: {
              contains: searchTerm,
              mode: 'insensitive'
            }
          }
        }
      }
    ]
  }

  return filter
}

export const Language = builder.prismaObject('Language', {
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime', nullable: false }),
    bcp47: t.exposeString('bcp47'),
    iso3: t.exposeString('iso3'),
    slug: t.exposeString('slug'),
    hasVideos: t.exposeBoolean('hasVideos', { nullable: false }),
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
    audioPreview: t.relation('audioPreview')
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
      where: t.arg({ type: LanguagesFilter, required: false }),
      term: t.arg.string({ required: false })
    },
    resolve: async (query, _parent, { offset, limit, where, term }) => {
      return await prisma.language.findMany({
        ...query,
        where: languageWhereInput(where, term, true),
        orderBy: { id: 'asc' },
        skip: offset ?? undefined,
        take: limit ?? undefined
      })
    }
  }),

  languagesCount: t.int({
    nullable: false,
    args: {
      where: t.arg({ type: LanguagesFilter, required: false }),
      term: t.arg.string({ required: false })
    },
    resolve: async (_parent, { where, term }) => {
      return await prisma.language.count({
        where: languageWhereInput(where, term, true)
      })
    }
  }),

  adminLanguages: t.withAuth({ isPublisher: true }).prismaField({
    type: ['Language'],
    nullable: false,
    args: {
      offset: t.arg.int({ required: false }),
      limit: t.arg.int({ required: false }),
      where: t.arg({ type: AdminLanguagesFilter, required: false }),
      term: t.arg.string({ required: false })
    },
    resolve: async (query, _parent, { offset, limit, where, term }) => {
      return await prisma.language.findMany({
        ...query,
        where: languageWhereInput(where, term),
        orderBy: { id: 'asc' },
        skip: offset ?? undefined,
        take: limit ?? undefined
      })
    }
  }),

  adminLanguagesCount: t.withAuth({ isPublisher: true }).int({
    nullable: false,
    args: {
      where: t.arg({ type: AdminLanguagesFilter, required: false }),
      term: t.arg.string({ required: false })
    },
    resolve: async (_parent, { where, term }) => {
      return await prisma.language.count({
        where: languageWhereInput(where, term)
      })
    }
  })
}))

builder.mutationFields((t) => ({
  languageUpdate: t.withAuth({ isPublisher: true }).prismaField({
    type: 'Language',
    nullable: false,
    args: {
      input: t.arg({ type: LanguageUpdateInput, required: true })
    },
    resolve: async (query, _parent, { input }) =>
      await prisma.language.update({
        ...query,
        where: { id: input.id },
        data: {
          bcp47: optionalString(input.bcp47),
          iso3: optionalString(input.iso3)
        }
      })
  }),
  languageNameUpdate: t.withAuth({ isPublisher: true }).prismaField({
    type: 'Language',
    nullable: false,
    args: {
      input: t.arg({ type: LanguageNameUpdateInput, required: true })
    },
    resolve: async (query, _parent, { input }) => {
      const languageId = input.nameLanguageId ?? input.languageId
      const primary = input.nameLanguageId == null
      const existingName = await prisma.languageName.findFirst({
        where: {
          parentLanguageId: input.languageId,
          languageId,
          primary
        },
        select: { id: true }
      })

      if (existingName != null) {
        await prisma.languageName.update({
          where: { id: existingName.id },
          data: { value: input.value.trim() }
        })
      } else {
        await prisma.languageName.create({
          data: {
            parentLanguageId: input.languageId,
            languageId,
            primary,
            value: input.value.trim()
          }
        })
      }

      return await prisma.language.findUniqueOrThrow({
        ...query,
        where: { id: input.languageId }
      })
    }
  })
}))
