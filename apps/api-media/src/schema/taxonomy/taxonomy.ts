import { Prisma } from '.prisma/api-media-client'

import { prisma } from '../../lib/prisma'
import { builder } from '../builder'

const TaxonomiesFilter = builder.inputType('TaxonomiesFilter', {
  fields: (t) => ({
    ids: t.field({
      type: ['ID']
    }),
    category: t.string({ required: false })
  })
})

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
        if (
          languageCodes !== undefined &&
          languageCodes !== null &&
          languageCodes.length > 0
        ) {
          where.languageCode = { in: languageCodes }
        }
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
    args: {
      offset: t.arg.int({ required: false }),
      limit: t.arg.int({ required: false }),
      where: t.arg({ type: TaxonomiesFilter, required: false })
    },
    resolve: async (query, _parent, { offset, limit, where }) => {
      const filter: Prisma.TaxonomyWhereInput = {}
      if (where !== null && where !== undefined) {
        if (where?.ids !== null) filter.id = { in: where.ids }
        if (where?.category !== null) filter.category = where.category
      }
      const taxonomies = await prisma.taxonomy.findMany({
        ...query,
        where: filter,
        skip: offset ?? undefined,
        take: limit ?? undefined
      })
      return taxonomies
    }
  })
}))
