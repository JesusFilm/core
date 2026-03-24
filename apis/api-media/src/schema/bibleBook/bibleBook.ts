import compact from 'lodash/compact'

import { Prisma, prisma } from '@core/prisma/media/client'

import { DateTimeFilter, builder, toPrismaDateTimeFilter } from '../builder'
import { Language } from '../language'

builder.prismaObject('BibleBookName', {
  fields: (t) => ({
    value: t.exposeString('value', { nullable: false }),
    primary: t.exposeBoolean('primary', { nullable: false }),
    language: t.field({
      type: Language,
      nullable: false,
      resolve: ({ languageId: id }) => ({ id })
    })
  })
})

builder.prismaObject('BibleBook', {
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime', nullable: false }),
    name: t.relation('name', {
      nullable: false,
      args: {
        languageId: t.arg.id({ required: false }),
        primary: t.arg.boolean({ required: false })
      },
      query: ({ languageId, primary }) => ({
        where: {
          OR: compact([
            primary != null ? { primary } : undefined,
            { languageId: languageId ?? '529' }
          ])
        },
        orderBy: { primary: 'desc' }
      })
    }),
    osisId: t.exposeString('osisId', { nullable: false }),
    alternateName: t.exposeString('alternateName'),
    paratextAbbreviation: t.exposeString('paratextAbbreviation', {
      nullable: false
    }),
    isNewTestament: t.exposeBoolean('isNewTestament', { nullable: false }),
    order: t.exposeInt('order', { nullable: false })
  })
})

const BibleBooksFilter = builder.inputType('BibleBooksFilter', {
  fields: (t) => ({
    updatedAt: t.field({ type: DateTimeFilter, required: false })
  })
})

builder.queryFields((t) => ({
  bibleBooks: t.prismaField({
    type: ['BibleBook'],
    nullable: false,
    args: {
      where: t.arg({ type: BibleBooksFilter, required: false })
    },
    resolve: async (query, _parent, { where }) => {
      const filter: Prisma.BibleBookWhereInput = {}
      filter.updatedAt = toPrismaDateTimeFilter(where?.updatedAt)
      return await prisma.bibleBook.findMany({
        ...query,
        where: filter,
        orderBy: { order: 'asc' }
      })
    }
  })
}))
