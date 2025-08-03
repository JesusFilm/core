import { Prisma } from '.prisma/api-languages-client'

import { builder } from '../builder'

builder.prismaObject('Continent', {
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    name: t.relation('name', {
      nullable: false,
      args: {
        languageId: t.arg.id({ required: false }),
        primary: t.arg.boolean({ required: false })
      },
      query: ({ languageId, primary }) => {
        const where: Prisma.ContinentNameWhereInput = {
          OR: languageId == null && primary == null ? undefined : []
        }
        if (languageId != null) where.OR?.push({ languageId })
        if (primary != null) where.OR?.push({ primary })
        return {
          where,
          orderBy: { primary: 'desc', include: { language: true } }
        }
      }
    }),
    countries: t.relation('countries', { nullable: false })
  })
})

builder.prismaObject('ContinentName', {
  fields: (t) => ({
    value: t.exposeString('value', { nullable: false }),
    primary: t.exposeBoolean('primary', { nullable: false }),
    language: t.relation('language', { nullable: false })
  })
})
