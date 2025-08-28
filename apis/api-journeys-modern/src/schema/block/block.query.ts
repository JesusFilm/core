import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { Block } from './block'

builder.queryField('block', (t) =>
  t.field({
    override: {
      from: 'api-journeys'
    },
    type: Block,
    nullable: true,
    args: {
      id: t.arg({ type: 'ID', required: true })
    },
    resolve: async (_parent, args) => {
      const { id } = args

      return await prisma.block.findUnique({
        where: { id, deletedAt: null }
      })
    }
  })
)
