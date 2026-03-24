import { prisma } from '@core/prisma/media/client'

import { builder } from '../builder'
import { Language } from '../language'

builder.prismaObject('Keyword', {
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime', nullable: false }),
    value: t.exposeString('value', { nullable: false }),
    language: t.field({
      type: Language,
      nullable: false,
      resolve: ({ languageId: id }) => ({ id })
    })
  })
})

const KeywordsFilter = builder.inputType('KeywordsFilter', {
  fields: (t) => ({
    updatedSince: t.field({ type: 'DateTime', required: false })
  })
})

builder.queryFields((t) => ({
  keywords: t.prismaField({
    type: ['Keyword'],
    nullable: false,
    args: {
      where: t.arg({ type: KeywordsFilter, required: false })
    },
    resolve: async (query, _parent, { where }) =>
      await prisma.keyword.findMany({
        ...query,
        where: {
          updatedAt:
            where?.updatedSince != null
              ? { gte: where.updatedSince }
              : undefined
        }
      })
  })
}))
// createKeyword mutation
builder.mutationFields((t) => ({
  createKeyword: t.withAuth({ isPublisher: true }).prismaField({
    type: 'Keyword',
    nullable: false,
    args: {
      value: t.arg.string({ required: true }),
      languageId: t.arg.string({ required: true })
    },
    resolve: async (
      query,
      _parent: unknown,
      args: { value: string; languageId: string }
    ) => {
      return await prisma.keyword.upsert({
        where: {
          value_languageId: {
            value: args.value,
            languageId: args.languageId
          }
        },
        update: {},
        create: {
          value: args.value,
          languageId: args.languageId
        },
        ...query
      })
    }
  })
}))
