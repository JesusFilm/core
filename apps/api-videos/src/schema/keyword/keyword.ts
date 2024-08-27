import { prisma } from '../../lib/prisma'
import { builder } from '../builder'
import { Language } from '../language'

builder.prismaObject('Keyword', {
  fields: (t) => ({
    id: t.exposeID('id'),
    value: t.exposeString('value'),
    language: t.field({
      type: Language,
      resolve: ({ languageId: id }) => ({ id })
    })
  })
})

builder.queryFields((t) => ({
  keywords: t.prismaField({
    type: ['Keyword'],
    resolve: async (query) => await prisma.keyword.findMany({ ...query })
  })
}))
