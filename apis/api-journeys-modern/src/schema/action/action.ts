import { GraphQLError } from 'graphql'

import { prisma } from '../../lib/prisma'
import { Block } from '../block'
import { builder } from '../builder'

export const ActionInterface = builder.prismaInterface('Action', {
  fields: (t) => ({
    parentBlockId: t.exposeID('parentBlockId'),
    gtmEventName: t.exposeString('gtmEventName', { nullable: true }),
    parentBlock: t.field({
      type: Block,
      resolve: async (action) => {
        const block = await prisma.block.findUnique({
          where: { id: action.parentBlockId }
        })
        if (!block) {
          throw new GraphQLError('Parent block not found', {
            extensions: { code: 'NOT_FOUND' }
          })
        }
        return block
      }
    })
  }),
  resolveType: (action) => {
    if (action.blockId != null) return 'NavigateToBlockAction'
    if (action.email != null) return 'EmailAction'
    return 'LinkAction'
  }
})
