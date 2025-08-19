import { Prisma, prisma } from '@core/prisma/media/client'

import { builder } from '../builder'
import { Language } from '../language'

builder.prismaObject('TaxonomyName', {
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    term: t.exposeString('term', { nullable: false }),
    label: t.exposeString('label', { nullable: false }),
    language: t.field({
      type: Language,
      nullable: false,
      resolve: ({ languageId: id, languageCode: bcp47 }) => ({ id, bcp47 })
    }),
    taxonomy: t.relation('taxonomy', { nullable: false })
  })
})

builder.prismaObject('Taxonomy', {
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    category: t.exposeString('category', { nullable: false }),
    term: t.exposeString('term', { nullable: false }),
    name: t.relation('name', {
      nullable: false,
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
