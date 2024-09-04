import compact from 'lodash/compact'

import { prisma } from '../../lib/prisma'
import { builder } from '../builder'

import { Service } from './enums/service'

const Tag = builder.prismaObject('Tag', {
  fields: (t) => ({
    id: t.exposeID('id'),
    parentId: t.exposeID('parentId', { nullable: true }),
    name: t.relation('tagName', {
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
    service: t.expose('service', { type: Service, nullable: true })
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
    resolve: async (query) =>
      await prisma.tag.findMany({
        ...query,
        orderBy: {
          name: 'asc'
        }
      })
  })
}))
