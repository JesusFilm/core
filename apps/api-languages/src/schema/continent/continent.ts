import { Prisma } from '.prisma/api-languages-client'

import { prisma } from '../../lib/prisma'
import { builder } from '../builder'

builder.prismaObject('Continent', {
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.prismaField({
      type: [ContinentName],
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
    countries: t.relation('countries')
  })
})

const ContinentName = builder.prismaObject('ContinentName', {
  fields: (t) => ({
    value: t.exposeString('value'),
    primary: t.exposeBoolean('primary'),
    language: t.relation('language')
  })
})
