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
        languageCodes: t.arg.stringList({ required: false }),
        category: t.arg.string({ required: false })
      },
      query: ({ languageId, languageCodes, category }) => {
        const where: Prisma.TaxonomyNameWhereInput = {}
        if (languageId !== null) where.languageId = languageId
        if (languageCodes !== null) where.languageCode = { in: languageCodes }
        if (category !== null) where.taxonomy = { category }
        return { where }
      }
    })
  })
})

builder.queryFields((t) => ({
  taxonomies: t.prismaField({
    type: ['Taxonomy'],
    nullable: false,
    args: {
      category: t.arg.string({ required: false })
    },
    resolve: async (query, _parent, { category }) => {
      const taxonomies = await prisma.taxonomy.findMany({
        ...query,
        where: {
          ...(category !== null && { category })
        }
      })
      return taxonomies
    }
  })
}))
