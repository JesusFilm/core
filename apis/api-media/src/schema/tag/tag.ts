import compact from 'lodash/compact'

import { prisma } from '@core/prisma/media/client'

import { builder } from '../builder'
import { Service } from '../enums/service'

const Tag = builder.prismaObject('Tag', {
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    parentId: t.exposeID('parentId'),
    name: t.relation('tagName', {
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
    service: t.expose('service', { type: Service })
  })
})

builder.asEntity(Tag, {
  key: builder.selection<{ id: string }>('id'),
  resolveReference: async ({ id }) =>
    await prisma.tag.findUniqueOrThrow({ where: { id } })
})

builder.queryFields((t) => ({
  tags: t.prismaField({
    type: ['Tag'],
    nullable: false,
    resolve: async (query) =>
      await prisma.tag.findMany({
        ...query,
        orderBy: {
          name: 'asc'
        }
      })
  })
}))
