import { Prisma } from '.prisma/api-media-client'

import { prisma } from '../../lib/prisma'
import { builder } from '../builder'

builder.prismaObject('TaxonomyName', {
  fields: (t) => ({
    id: t.exposeID('id'),
    term: t.exposeString('term'),
    label: t.exposeString('label'),
    languageId: t.exposeString('languageId'),
    languageCode: t.exposeString('languageCode'),
    taxonomy: t.relation('taxonomy')
  })
})

export const Taxonomy = builder.prismaObject('Taxonomy', {
  fields: (t) => ({
    id: t.exposeID('id'),
    category: t.exposeString('category'),
    term: t.exposeString('term'),
    name: t.relation('name', {
      args: {
        languageId: t.arg.string({ required: false }),
        languageCodes: t.arg.stringList({ required: false })
      },
      query: ({ languageId, languageCodes }) => {
        const where: Prisma.TaxonomyNameWhereInput = {}
        if (languageId !== null) where.languageId = languageId
        if (languageCodes !== null) where.languageCode = { in: languageCodes }
        return { where }
      }
    })
  })
})

builder.queryFields((t) => ({
  taxonomy: t.prismaField({
    type: 'Taxonomy',
    nullable: true,
    args: {
      id: t.arg.id({ required: true })
    },
    resolve: async (query, _parent, { id }) => {
      const taxonomy = await prisma.taxonomy.findUnique({
        ...query,
        where: { id }
      })
      return taxonomy ?? null
    }
  }),

  taxonomies: t.prismaField({
    type: ['Taxonomy'],
    nullable: false,
    resolve: async (query, _parent) => {
      const taxonomies = await prisma.taxonomy.findMany({
        ...query
      })
      return taxonomies
    }
  })
}))
