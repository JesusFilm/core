import compact from 'lodash/compact'

import { prisma } from '../../lib/prisma'
import { builder } from '../builder'
import { Language } from '../language'

builder.prismaObject('BibleBookName', {
  fields: (t) => ({
    value: t.exposeString('value'),
    primary: t.exposeBoolean('primary'),
    language: t.field({
      type: Language,
      resolve: ({ languageId: id }) => ({ id })
    })
  })
})

builder.prismaObject('BibleBook', {
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.relation('name', {
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
    osisId: t.exposeString('osisId'),
    alternateName: t.exposeString('alternateName', { nullable: true }),
    paratextAbbreviation: t.exposeString('paratextAbbreviation'),
    isNewTestament: t.exposeBoolean('isNewTestament'),
    order: t.exposeInt('order')
  })
})

builder.queryFields((t) => ({
  bibleBooks: t.prismaField({
    type: ['BibleBook'],
    resolve: async (query) =>
      await prisma.bibleBook.findMany({
        ...query,
        orderBy: { order: 'asc' }
      })
  })
}))
