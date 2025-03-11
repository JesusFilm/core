import { prisma } from '../../lib/prisma'
import { builder } from '../builder'
import { Language } from '../language'

builder.prismaObject('Keyword', {
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    value: t.exposeString('value', { nullable: false }),
    language: t.field({
      type: Language,
      nullable: false,
      resolve: ({ languageId: id }) => ({ id })
    })
  })
})

builder.queryFields((t) => ({
  keywords: t.prismaField({
    type: ['Keyword'],
    nullable: false,
    resolve: async (query) => await prisma.keyword.findMany({ ...query })
  })
}))
