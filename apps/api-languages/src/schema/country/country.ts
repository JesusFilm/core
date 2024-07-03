import { Prisma } from '.prisma/api-languages-client'

import { prisma } from '../../lib/prisma'

import { builder } from '../builder'
import { Language } from '../language/language'
import { Translation } from '../translation'

const Country = builder.prismaObject('Country', {
  fields: (t) => ({
    id: t.exposeID('id'),
    population: t.exposeInt('population', { nullable: true }),
    latitude: t.exposeFloat('latitude', { nullable: true }),
    longitude: t.exposeFloat('longitude', { nullable: true }),
    flagPngSrc: t.exposeString('flagPngSrc', { nullable: true }),
    flagWebpSrc: t.exposeString('flagWebpSrc', { nullable: true }),
    languages: t.relation('languages', { type: Language }),
    name: t.field({
      type: [Translation],
      args: {
        languageId: t.arg.id({ required: false }),
        primary: t.arg.boolean({ required: false })
      },
      resolve: async (country, { languageId, primary }) => {
        const where: Prisma.CountryNameWhereInput = {
          countryId: country.id,
          OR: languageId == null && primary == null ? undefined : []
        }
        if (languageId != null) where.OR?.push({ languageId })
        if (primary != null) where.OR?.push({ primary })
        return await prisma.countryName.findMany({
          where,
          orderBy: { primary: 'desc' },
          include: { language: true }
        })
      }
    }),
    continent: t.field({
      type: [Translation],
      args: {
        languageId: t.arg.id({ required: false }),
        primary: t.arg.boolean({ required: false })
      },
      resolve: async (country, { languageId, primary }) => {
        const where: Prisma.CountryContinentWhereInput = {
          countryId: country.id,
          OR: languageId == null && primary == null ? undefined : []
        }
        if (languageId != null) where.OR?.push({ languageId })
        if (primary != null) where.OR?.push({ primary })
        return await prisma.countryContinent.findMany({
          where,
          orderBy: { primary: 'desc' },
          include: { language: true }
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
    nullable: true,
    args: {
      id: t.arg.id({ required: true })
    },
    resolve: async (
      query: {
        include?: Prisma.CountryInclude
        select?: Prisma.CountrySelect
      },
      root: unknown,
      { id }
    ) =>
      prisma.country.findUnique({
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
    }) => await prisma.country.findMany(query)
  })
}))
