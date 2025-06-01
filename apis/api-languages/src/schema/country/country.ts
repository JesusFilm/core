import { Prisma, prisma } from '@core/prisma-languages/client'

import { parseFullTextSearch } from '../../lib/parseFullTextSearch'
import { builder } from '../builder'
import { Language } from '../language/language'

const CountryName = builder.prismaObject('CountryName', {
  fields: (t) => ({
    value: t.exposeString('value', { nullable: false }),
    primary: t.exposeBoolean('primary', { nullable: false }),
    language: t.relation('language', { nullable: false })
  })
})

const Country = builder.prismaObject('Country', {
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    population: t.exposeInt('population'),
    latitude: t.exposeFloat('latitude'),
    longitude: t.exposeFloat('longitude'),
    flagPngSrc: t.exposeString('flagPngSrc'),
    flagWebpSrc: t.exposeString('flagWebpSrc'),
    languages: t.relation('languages', { type: Language, nullable: false }),
    name: t.prismaField({
      type: [CountryName],
      nullable: false,
      args: {
        languageId: t.arg.id({ required: false }),
        primary: t.arg.boolean({ required: false })
      },
      resolve: async (query, country, { languageId, primary }) => {
        const where: Prisma.CountryNameWhereInput = {
          countryId: country.id,
          OR: languageId == null && primary == null ? undefined : []
        }
        if (languageId != null) where.OR?.push({ languageId })
        if (primary != null) where.OR?.push({ primary })
        return await prisma.countryName.findMany({
          ...query,
          where,
          orderBy: { primary: 'desc' },
          include: { language: true }
        })
      }
    }),
    continent: t.relation('continent', { nullable: false, onNull: 'error' }),
    countryLanguages: t.prismaField({
      type: ['CountryLanguage'],
      nullable: false,
      resolve: async (query, country) => {
        return await prisma.countryLanguage.findMany({
          ...query,
          where: {
            countryId: country.id,
            language: {
              hasVideos: true
            }
          }
        })
      }
    }),
    languageCount: t.int({
      nullable: false,
      resolve: async (country) => {
        return await prisma.countryLanguage.count({
          where: { countryId: country.id, suggested: false }
        })
      }
    }),
    languageHavingMediaCount: t.int({
      nullable: false,
      resolve: async (country) => {
        return await prisma.language.count({
          where: {
            countryLanguages: { some: { countryId: country.id } },
            hasVideos: true
          }
        })
      }
    })
  })
})

builder.asEntity(Country, {
  key: builder.selection<{ id: string }>('id'),
  resolveReference: async ({ id }) =>
    await prisma.country.findUnique({ where: { id } })
})

builder.queryFields((t) => ({
  country: t.prismaField({
    type: 'Country',
    args: {
      id: t.arg.id({ required: true })
    },
    resolve: async (query, _parent, { id }) =>
      await prisma.country.findUnique({
        ...query,
        where: { id }
      })
  }),
  countries: t.prismaField({
    type: ['Country'],
    nullable: false,
    args: {
      term: t.arg.string({ required: false }),
      ids: t.arg.idList({ required: false })
    },
    resolve: async (query, _parent, { term, ids }) => {
      const filter: Prisma.CountryWhereInput = {}
      if (term != null) {
        filter.name = {
          some: {
            value: {
              contains: parseFullTextSearch(term),
              mode: 'insensitive'
            }
          }
        }
      }
      if (ids != null) {
        filter.id = { in: ids }
      }
      return await prisma.country.findMany({
        ...query,
        where: filter
      })
    }
  })
}))
