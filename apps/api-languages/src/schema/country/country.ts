import { Prisma } from '.prisma/api-languages-client'

import { prisma } from '../../lib/prisma'
import { builder } from '../builder'
import { Language } from '../language/language'

const CountryName = builder.prismaObject('CountryName', {
  fields: (t) => ({
    value: t.exposeString('value'),
    primary: t.exposeBoolean('primary'),
    language: t.relation('language')
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
    languages: t.relation('languages', { type: Language }),
    name: t.prismaField({
      type: [CountryName],
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
    continent: t.relation('continent'),
    countryLanguages: t.relation('countryLanguages')
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
    resolve: async (query, _parent, { id }) =>
      await prisma.country.findUnique({
        ...query,
        where: { id }
      })
  }),
  countries: t.prismaField({
    type: ['Country'],
    nullable: false,
    resolve: async (query) => await prisma.country.findMany(query)
  })
}))
