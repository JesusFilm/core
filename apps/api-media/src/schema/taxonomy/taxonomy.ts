import { Prisma } from '.prisma/api-media-client'

import { prisma } from '../../lib/prisma'
import { builder } from '../builder'
import { Language } from '../language'

builder.prismaObject('TaxonomyName', {
  fields: (t) => ({
    id: t.exposeID('id'),
    term: t.exposeString('term'),
    label: t.exposeString('label'),
    language: t.field({
      type: Language,
      resolve: ({ languageId: id, languageCode: bcp47 }) => ({ id, bcp47 })
    }),
    taxonomy: t.relation('taxonomy')
  })
})

builder.prismaObject('Taxonomy', {
  fields: (t) => ({
    id: t.exposeID('id'),
    category: t.exposeString('category'),
    term: t.exposeString('term'),
    name: t.relation('name', {
      args: {
        languageCodes: t.arg.stringList({ required: false }),
        category: t.arg.string({ required: false })
      },
      query: ({ languageCodes, category }) => {
        const where: Prisma.TaxonomyNameWhereInput = {}
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
      category: t.arg.string({ required: false }),
      languageCodes: t.arg.stringList({ required: false })
    },
    resolve: async (query, _parent, { category, languageCodes }) => {
      const taxonomies = await prisma.taxonomy.findMany({
        ...query,
        where: {
          ...(category !== null && { category }),
          ...(languageCodes !== null && {
            name: { some: { languageCode: { in: languageCodes } } }
          })
        }
      })
      return taxonomies
    }
  })
}))
