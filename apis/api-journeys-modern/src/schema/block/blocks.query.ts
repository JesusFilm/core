import { Prisma, prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { Block } from './block'
import { BlocksFilterInput } from './inputs'

builder.queryField('blocks', (t) =>
  t.field({
    override: {
      from: 'api-journeys'
    },
    type: [Block],
    nullable: false,
    args: {
      where: t.arg({ type: BlocksFilterInput, required: false })
    },
    resolve: async (_parent, args) => {
      const { where } = args

      const filter: Prisma.BlockWhereInput = {
        deletedAt: null
      }

      if (where?.journeyIds) {
        filter.journeyId = { in: where.journeyIds }
      }

      if (where?.typenames) {
        filter.typename = { in: where.typenames }
      }

      return await prisma.block.findMany({
        where: filter,
        orderBy: { parentOrder: 'asc' }
      })
    }
  })
)
