import { Prisma, prisma } from '@core/prisma/languages/client'

import { builder } from '../builder'

builder.prismaObject('Continent', {
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    name: t.prismaField({
      type: [ContinentName],
      nullable: false,
      args: {
        languageId: t.arg.id({ required: false }),
        primary: t.arg.boolean({ required: false })
      },
      resolve: async (query, continent, { languageId, primary }) => {
        const where: Prisma.ContinentNameWhereInput = {
          continentId: continent.id,
          OR: languageId == null && primary == null ? undefined : []
        }
        if (languageId != null) where.OR?.push({ languageId })
        if (primary != null) where.OR?.push({ primary })
        return await prisma.continentName.findMany({
          ...query,
          where,
          orderBy: { primary: 'desc' },
          include: { language: true }
        })
      }
    }),
    countries: t.relation('countries', { nullable: false })
  })
})

const ContinentName = builder.prismaObject('ContinentName', {
  fields: (t) => ({
    value: t.exposeString('value', { nullable: false }),
    primary: t.exposeBoolean('primary', { nullable: false }),
    language: t.relation('language', { nullable: false })
  })
})
