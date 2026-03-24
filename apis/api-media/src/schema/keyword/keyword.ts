import { prisma } from '@core/prisma/media/client'

import { DateTimeFilter, builder, toPrismaDateTimeFilter } from '../builder'
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
    updatedAt: t.field({ type: DateTimeFilter, required: false })
  })
})

builder.queryFields((t) => ({
  keywords: t.prismaField({
    type: ['Keyword'],
    nullable: false,
    args: {
      where: t.arg({ type: KeywordsFilter, required: false })
    },
    resolve: async (query, _parent, { where }) => {
      const updatedAt = toPrismaDateTimeFilter(where?.updatedAt)
      return await prisma.keyword.findMany({
        ...query,
        where: updatedAt != null ? { updatedAt } : undefined
      })
    }
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
