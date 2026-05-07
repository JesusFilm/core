import { Prisma, prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'
import { journeyReadAccessWhere } from '../journey/journey.acl'

import { Block } from './block'
import { BlocksFilterInput } from './inputs'

builder.queryField('blocks', (t) =>
  t.withAuth({ $any: { isAuthenticated: true, isAnonymous: true } }).field({
    type: [Block],
    nullable: false,
    override: { from: 'api-journeys' },
    args: {
      where: t.arg({ type: BlocksFilterInput, required: false })
    },
    resolve: async (_parent, args, context) => {
      const userId = context.user.id
      const currentUser = context.user as typeof context.user & {
        roles?: string[]
      }

      const filter: Prisma.BlockWhereInput = {
        deletedAt: null
      }

      if (args.where?.typenames != null)
        filter.typename = { in: args.where.typenames }
      if (args.where?.journeyIds != null)
        filter.journeyId = { in: args.where.journeyIds as string[] }

      const accessibleJourneys = journeyReadAccessWhere(userId, currentUser)

      return await prisma.block.findMany({
        where: {
          AND: [{ journey: { is: accessibleJourneys } }, filter]
        },
        include: {
          action: true
        }
      })
    }
  })
)
