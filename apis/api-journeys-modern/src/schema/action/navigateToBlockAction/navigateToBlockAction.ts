import { GraphQLError } from 'graphql'

import { prisma } from '../../../lib/prisma'
import { Block } from '../../block'
import { builder } from '../../builder'
import { ActionInterface } from '../action'

export const NavigateToBlockActionRef = builder.prismaObject('Action', {
  interfaces: [ActionInterface],
  variant: 'NavigateToBlockAction',
  isTypeOf: (action: any) => action.blockId != null,
  shareable: true,
  fields: (t) => ({
    parentBlockId: t.exposeID('parentBlockId'),
    gtmEventName: t.exposeString('gtmEventName', { nullable: true }),
    blockId: t.string({
      nullable: false,
      resolve: (action) => action.blockId || ''
    }),
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
  })
})
