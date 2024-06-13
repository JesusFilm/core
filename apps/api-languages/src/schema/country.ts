import { Prisma } from '.prisma/api-languages-client'

import { db } from '../db'

import { builder } from './builder'
import { Language } from './language'

const CountryName = builder.prismaObject('CountryName', {
  name: 'CountryName',
  shareable: true,
  fields: (t) => ({
    primary: t.exposeBoolean('primary'),
    value: t.exposeString('value'),
    language: t.relation('language', { type: Language })
  })
})

const CountryContinent = builder.prismaObject('CountryContinent', {
  name: 'CountryContinent',
  shareable: true,
  fields: (t) => ({
    primary: t.exposeBoolean('primary'),
    value: t.exposeString('value'),
    language: t.relation('language', { type: Language })
  })
})

const Country = builder.prismaObject('Country', {
  fields: (t) => ({
    id: t.exposeID('id'),
    population: t.exposeInt('population', { nullable: true }),
    latitude: t.exposeFloat('latitude', { nullable: true }),
    longitude: t.exposeFloat('longitude', { nullable: true }),
    flagPngSrc: t.exposeString('flagPngSrc', { nullable: true }),
    flagWebpSrc: t.exposeString('flagWebpSrc', { nullable: true }),
    name: t.relation('name', {
      type: CountryName,
      args: {
        languageId: t.arg.id({ required: false }),
        primary: t.arg.boolean({ required: false })
      },
      query: ({ languageId, primary }, context) => {
        const where: Prisma.CountryNameWhereInput = {
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
    }),
    continent: t.relation('continent', {
      type: CountryContinent,
      args: {
        languageId: t.arg.id({ required: false }),
        primary: t.arg.boolean({ required: false })
      },
      query: ({ languageId, primary }, context) => {
        const where: Prisma.CountryContinentWhereInput = {
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

builder.asEntity(Country, {
  key: builder.selection<{ id: string }>('id'),
  resolveReference: async ({ id }) =>
    await db.country.findUnique({ where: { id } })
})

builder.queryType({
  fields: (t) => ({
    country: t.prismaField({
      type: 'Country',
      nullable: true,
      args: {
        id: t.arg.id({ required: true })
      },
      resolve: async (
        query: {
          include?: Prisma.CountryInclude
          select?: Prisma.CountrySelect
        },
        root,
        { id }
      ) =>
        await db.country.findUnique({
          ...query,
          where: { id }
        })
    }),
    countries: t.prismaField({
      type: ['Country'],
      nullable: false,
      resolve: async (query: {
        include?: Prisma.CountryInclude
        select?: Prisma.CountrySelect
      }) =>
        await db.country.findMany({
          ...query
        })
    })
  })
})
